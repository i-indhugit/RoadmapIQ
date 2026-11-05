from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple, Optional


class DependencyCycleError(Exception):
    """Raised when a circular dependency is detected in the skill prerequisite graph."""
    def __init__(self, message: str, cycle: Optional[List[str]] = None):
        super().__init__(message)
        self.cycle = cycle or []


class TopologicalPlanner:
    """
    Constructs a Directed Acyclic Graph (DAG) of skills based on prerequisites,
    detects cycles, and produces an optimal topological ordering for learning.
    """

    def __init__(
        self,
        skill_ids: Set[int],
        prerequisites: List[Tuple[int, int]],  # (target_skill_id, prerequisite_skill_id)
        skill_names: Optional[Dict[int, str]] = None,
        skill_weights: Optional[Dict[int, int]] = None
    ):
        """
        :param skill_ids: Set of skill IDs in the target role curriculum.
        :param prerequisites: List of (target_skill_id, prereq_skill_id).
               Means 'prereq_skill_id' MUST be learned BEFORE 'target_skill_id'.
        :param skill_names: Mapping of skill_id to human-readable name.
        :param skill_weights: Mapping of skill_id to importance weight (1-5).
        """
        self.skill_ids = set(skill_ids)
        self.skill_names = skill_names or {}
        self.skill_weights = skill_weights or {sid: 1 for sid in skill_ids}

        # graph[u] = list of skills v that depend on u (u -> v, learning u unlocks v)
        self.adj: Dict[int, List[int]] = defaultdict(list)
        # in_degree[v] = number of unsatisfied prerequisites for v
        self.in_degree: Dict[int, int] = {sid: 0 for sid in self.skill_ids}
        # prereqs_of[v] = list of u that v depends on
        self.prereqs_of: Dict[int, List[int]] = defaultdict(list)

        for target_id, prereq_id in prerequisites:
            # Only consider dependencies between skills present in our curriculum
            if target_id in self.skill_ids and prereq_id in self.skill_ids and target_id != prereq_id:
                self.adj[prereq_id].append(target_id)
                self.in_degree[target_id] += 1
                self.prereqs_of[target_id].append(prereq_id)

    def detect_cycle(self) -> Optional[List[str]]:
        """
        Uses DFS with 3-color state (0=White/unvisited, 1=Gray/visiting, 2=Black/visited)
        to identify any circular dependencies.
        Returns the cycle as a list of skill names if found, or None.
        """
        state: Dict[int, int] = {sid: 0 for sid in self.skill_ids}
        parent: Dict[int, Optional[int]] = {sid: None for sid in self.skill_ids}
        cycle_nodes: List[int] = []

        def dfs(u: int) -> bool:
            state[u] = 1  # visiting (gray)
            for v in self.adj.get(u, []):
                if state[v] == 1:
                    # Cycle detected: backtrack from u to v
                    curr = u
                    cycle_nodes.append(v)
                    while curr != v and curr is not None:
                        cycle_nodes.append(curr)
                        curr = parent.get(curr)
                    cycle_nodes.append(v)
                    cycle_nodes.reverse()
                    return True
                elif state[v] == 0:
                    parent[v] = u
                    if dfs(v):
                        return True
            state[u] = 2  # visited (black)
            return False

        for sid in self.skill_ids:
            if state[sid] == 0:
                if dfs(sid):
                    # Convert IDs to readable names
                    return [self.skill_names.get(node, f"Skill #{node}") for node in cycle_nodes]

        return None

    def get_topological_order(self) -> List[int]:
        """
        Returns a topologically sorted list of skill IDs.
        Uses Kahn's algorithm with priority tie-breaking by importance weight.
        Raises DependencyCycleError if a circular dependency is detected.
        """
        # First check explicitly for cycles
        cycle = self.detect_cycle()
        if cycle:
            cycle_str = " -> ".join(cycle)
            raise DependencyCycleError(
                f"Prerequisite cycle detected in skill dependencies: {cycle_str}",
                cycle=cycle
            )

        # In-degree copy for Kahn's algorithm
        current_in_degree = dict(self.in_degree)

        # Candidate pool of skills with in-degree == 0 (no unfulfilled prerequisites)
        # We sort candidates so highest weight skills are chosen first
        order: List[int] = []
        available: List[int] = [sid for sid in self.skill_ids if current_in_degree[sid] == 0]

        while available:
            # Sort available by importance weight descending, then by name for determinism
            available.sort(key=lambda sid: (-self.skill_weights.get(sid, 1), self.skill_names.get(sid, "")))
            curr = available.pop(0)
            order.append(curr)

            # Reduce in-degree for all dependents
            for neighbor in self.adj.get(curr, []):
                current_in_degree[neighbor] -= 1
                if current_in_degree[neighbor] == 0:
                    available.append(neighbor)

        if len(order) < len(self.skill_ids):
            # Kahn's failed to resolve all nodes (cycle)
            remaining = [sid for sid in self.skill_ids if sid not in order]
            remaining_names = [self.skill_names.get(sid, str(sid)) for sid in remaining]
            raise DependencyCycleError(
                f"Circular dependency prevented topological ordering for skills: {', '.join(remaining_names)}"
            )

        return order
