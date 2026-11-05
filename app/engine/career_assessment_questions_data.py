"""
Rich Career-Specific Assessment Question Bank for RoadmapIQ.
Contains 25 balanced questions per career track across:
- 40% Fundamentals (10 questions)
- 30% Intermediate (8 questions)
- 20% Practical / Scenario / Code Output / Debugging (5 questions)
- 10% Advanced (2 questions)
"""

# Question structure:
# {
#     "category": str,
#     "difficulty": "fundamentals" | "intermediate" | "practical" | "advanced",
#     "question_type": "mcq" | "code_prediction" | "debugging" | "scenario" | "conceptual" | "practical",
#     "question": str,
#     "code_snippet": Optional[str],
#     "options": [str, str, str, str],
#     "correct_answer_index": int (0-3),
#     "explanation": str,
#     "marks": int (1 or 2)
# }

CAREER_QUESTIONS: dict = {}

# -------------------------------------------------------------
# 1. Java Developer (25 Questions)
# -------------------------------------------------------------
CAREER_QUESTIONS["java-developer"] = [
    # Fundamentals (10)
    {
        "category": "Java Fundamentals",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the primary role of the Java Virtual Machine (JVM) during execution?",
        "options": [
            "Compiles Java source code directly to native x86 machine instructions",
            "Loads, verifies, and executes Java bytecode on host platforms",
            "Acts as a relational database driver for JDBC connections",
            "Manages browser DOM rendering for client applications"
        ],
        "correct_answer_index": 1,
        "explanation": "The JVM interprets or JIT-compiles platform-independent bytecode into host machine instructions, providing Java's 'Write Once, Run Anywhere' capability.",
        "marks": 1
    },
    {
        "category": "Java Fundamentals",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which primitive data type in Java has a size of exactly 64 bits?",
        "options": ["int", "float", "long", "short"],
        "correct_answer_index": 2,
        "explanation": "In Java, 'long' is a signed two's complement integer of 64 bits (8 bytes). 'int' is 32 bits, 'float' is 32 bits, and 'short' is 16 bits.",
        "marks": 1
    },
    {
        "category": "Object-Oriented Programming",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Which OOP concept in Java allows a subclass to provide a specific implementation of a method defined in its superclass?",
        "options": ["Method Overloading", "Method Overriding", "Encapsulation", "Multiple Inheritance"],
        "correct_answer_index": 1,
        "explanation": "Method Overriding occurs when a subclass defines a method with the exact same signature and return type as in its superclass, resolved dynamically at runtime.",
        "marks": 1
    },
    {
        "category": "Object-Oriented Programming",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Why can an abstract class have constructors while an interface cannot in standard Java?",
        "options": [
            "Abstract classes can initialize member state fields inherited by concrete subclasses",
            "Interfaces are compiled into binary C libraries",
            "Constructors in abstract classes must always be public and static",
            "Interfaces cannot be compiled if they contain method signatures"
        ],
        "correct_answer_index": 0,
        "explanation": "Abstract classes can hold state (fields) and define constructors called via super() during subclass instantiation. Interfaces are contracts and do not hold instance state.",
        "marks": 1
    },
    {
        "category": "Collections Framework",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Which collection implementation in java.util provides O(1) average time complexity for insertion and retrieval and does not permit duplicate keys?",
        "options": ["TreeSet", "HashMap", "ArrayList", "LinkedList"],
        "correct_answer_index": 1,
        "explanation": "HashMap computes bucket indices via hashcode(), delivering O(1) average lookup and insertion without allowing duplicate keys.",
        "marks": 1
    },
    {
        "category": "Collections Framework",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the key functional difference between ArrayList and LinkedList in Java?",
        "options": [
            "ArrayList is synchronized while LinkedList is non-synchronized",
            "ArrayList is backed by a dynamic array offering O(1) random access, while LinkedList uses nodes with O(N) traversal",
            "LinkedList cannot store null elements",
            "ArrayList automatically sorts all added elements"
        ],
        "correct_answer_index": 1,
        "explanation": "ArrayList provides fast index-based lookups O(1) via contiguous memory, while LinkedList requires pointer traversal O(N) but offers efficient node insertion once localized.",
        "marks": 1
    },
    {
        "category": "Exception Handling",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which of the following is an unchecked (Runtime) exception in Java?",
        "options": ["IOException", "SQLException", "NullPointerException", "ClassNotFoundException"],
        "correct_answer_index": 2,
        "explanation": "NullPointerException extends RuntimeException, making it an unchecked exception that the compiler does not enforce catching.",
        "marks": 1
    },
    {
        "category": "SQL & DBMS",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which SQL clause is used to filter aggregated group records after a GROUP BY statement?",
        "options": ["WHERE", "HAVING", "ORDER BY", "DISTINCT"],
        "correct_answer_index": 1,
        "explanation": "HAVING filters aggregated groups (e.g. HAVING COUNT(*) > 5), whereas WHERE filters individual rows prior to grouping.",
        "marks": 1
    },
    {
        "category": "JDBC",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Why is PreparedStatement preferred over Statement in JDBC applications?",
        "options": [
            "PreparedStatement runs entirely in the client JVM without contacting the database",
            "PreparedStatement pre-compiles queries and prevents SQL injection vulnerabilities",
            "PreparedStatement automatically commits transactions on thread death",
            "PreparedStatement does not require a database connection string"
        ],
        "correct_answer_index": 1,
        "explanation": "PreparedStatement parameterized queries are pre-compiled and sanitize inputs, preventing SQL injection and improving execution efficiency for repeated calls.",
        "marks": 1
    },
    {
        "category": "Spring Boot",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What does the @RestController annotation signify in Spring Boot?",
        "options": [
            "It marks a class as a scheduled cron background worker",
            "It combines @Controller and @ResponseBody, automatically serializing return values to JSON/XML",
            "It instructs the JVM to bypass garbage collection for the controller instance",
            "It creates a direct JDBC socket to PostgreSQL"
        ],
        "correct_answer_index": 1,
        "explanation": "@RestController is a convenience annotation combining @Controller and @ResponseBody, ensuring handler method returns are serialized directly to HTTP response bodies.",
        "marks": 1
    },

    # Intermediate (8)
    {
        "category": "Multithreading",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What guarantee does the 'volatile' keyword provide for a variable in Java?",
        "options": [
            "Atomicity for compound operations like count++",
            "Visibility of writes across threads and prevention of instruction reordering",
            "Mutual exclusion lock on the variable's containing object",
            "Automatic persistence to disk storage"
        ],
        "correct_answer_index": 1,
        "explanation": "'volatile' guarantees memory visibility (reads/writes go directly to main memory rather than thread caches) and enforces happens-before order, but does not provide mutual exclusion atomicity for compound operations.",
        "marks": 1
    },
    {
        "category": "Spring Boot",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "How does Spring Boot handle Dependency Injection (DI) through constructor injection compared to field injection with @Autowired?",
        "options": [
            "Constructor injection promotes immutability, facilitates unit testing without Spring context, and fails fast on circular dependencies",
            "Field injection is faster at runtime because bytecode reflection is avoided",
            "Constructor injection can only inject primitive strings and integers",
            "Field injection is mandatory for singleton scoped beans"
        ],
        "correct_answer_index": 0,
        "explanation": "Constructor injection is the industry standard: fields can be marked final, test dependencies can be mocked directly without reflection, and dependency cycles are caught during instantiation.",
        "marks": 1
    },
    {
        "category": "REST APIs",
        "difficulty": "intermediate",
        "question_type": "scenario",
        "question": "In REST architectural design, which HTTP method is expected to be idempotent and used to replace an entire resource representation?",
        "options": ["POST", "PUT", "PATCH", "CONNECT"],
        "correct_answer_index": 1,
        "explanation": "PUT is idempotent: sending multiple identical PUT requests produces the exact same resource state. PATCH is for partial updates, and POST is non-idempotent creation.",
        "marks": 1
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is the worst-case time complexity of inserting an element into a balanced Red-Black Tree (such as Java's TreeMap)?",
        "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        "correct_answer_index": 1,
        "explanation": "Because Red-Black Trees maintain a balanced height bounded by 2 * log2(N + 1), search, insertion, and deletion are guaranteed O(log N) in the worst case.",
        "marks": 1
    },
    {
        "category": "SQL & DBMS",
        "difficulty": "intermediate",
        "question_type": "practical",
        "question": "When would a B-tree database index fail to accelerate a SQL search query?",
        "options": [
            "When searching on an exact match column with high selectivity",
            "When using leading wildcards like WHERE name LIKE '%son'",
            "When performing an equality check WHERE user_id = 1042",
            "When ordering records using an indexed timestamp column"
        ],
        "correct_answer_index": 1,
        "explanation": "B-Tree indexes sort keys from left to right. A leading wildcard '%son' prevents tree traversal and forces a full table scan.",
        "marks": 1
    },
    {
        "category": "Collections Framework",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What happens if two unequal objects return the exact same hashCode() in Java?",
        "options": [
            "The JVM throws a DuplicateKeyException immediately",
            "The second object overwrites the first and discards it",
            "A hash collision occurs; both objects are stored in the same bucket and differentiated by equals()",
            "The HashMap capacity is automatically reset to zero"
        ],
        "correct_answer_index": 2,
        "explanation": "Hash collisions are expected. Entries sharing the same hash bucket are stored in a linked list or red-black tree (since Java 8) and distinguished by equals().",
        "marks": 1
    },
    {
        "category": "Exception Handling",
        "difficulty": "intermediate",
        "question_type": "debugging",
        "question": "What will be printed when this Java block executes?",
        "code_snippet": "public static int test() {\n    try {\n        return 1;\n    } finally {\n        return 2;\n    }\n}",
        "options": ["1", "2", "Compilation error", "UnhandledExceptionError"],
        "correct_answer_index": 1,
        "explanation": "The 'finally' block always executes before method exit, and returning from 'finally' overrides any return value or pending unhandled exception from 'try'.",
        "marks": 1
    },
    {
        "category": "Multithreading",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "Why is ExecutorService preferred over creating raw 'new Thread()' objects in high-throughput applications?",
        "options": [
            "Raw threads execute outside the CPU",
            "ExecutorService reuses a pooled set of worker threads, reducing OS thread allocation and context switching overhead",
            "Raw threads cannot throw checked exceptions",
            "ExecutorService eliminates all synchronization requirements"
        ],
        "correct_answer_index": 1,
        "explanation": "Thread creation consumes native OS memory (~1MB stack) and context switching costs. Thread pools bound resource usage and reuse idle workers.",
        "marks": 1
    },

    # Practical / Code Output / Debugging (5)
    {
        "category": "Debugging",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "What is the output of the following Java string comparison snippet?",
        "code_snippet": "String s1 = \"hello\";\nString s2 = new String(\"hello\");\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
        "options": [
            "true true",
            "false true",
            "false false",
            "true false"
        ],
        "correct_answer_index": 1,
        "explanation": "s1 references the string constant pool, while 'new String()' explicitly allocates a distinct object on the heap, so '==' is false. 'equals()' checks character sequence content, so it is true.",
        "marks": 2
    },
    {
        "category": "Problem Solving",
        "difficulty": "practical",
        "question_type": "debugging",
        "question": "Identify the bug in this thread-safe Singleton implementation:",
        "code_snippet": "public class Singleton {\n    private static Singleton instance;\n    private Singleton() {}\n    public static Singleton getInstance() {\n        if (instance == null) {\n            synchronized(Singleton.class) {\n                if (instance == null) {\n                    instance = new Singleton();\n                }\n            }\n        }\n        return instance;\n    }\n}",
        "options": [
            "The constructor must be public",
            "The 'instance' field must be declared 'volatile' to prevent partially initialized object exposure from instruction reordering",
            "The method getInstance() must be marked synchronized on every invocation",
            "The synchronized block should synchronize on 'this'"
        ],
        "correct_answer_index": 1,
        "explanation": "Without 'volatile', the JVM or CPU compiler can reorder instructions during 'new Singleton()' (allocating memory -> publishing reference -> executing constructor). Another thread could observe a non-null, uninitialized reference.",
        "marks": 2
    },
    {
        "category": "Spring Boot",
        "difficulty": "practical",
        "question_type": "scenario",
        "question": "In a Spring Boot JPA application, a method marked @Transactional throws a checked Exception (e.g., Exception.class), but the database row is NOT rolled back. Why?",
        "options": [
            "By default, Spring declarative @Transactional only rolls back on unchecked (RuntimeException and Error) exceptions unless specified via rollbackFor",
            "Spring does not support transactions on relational databases",
            "@Transactional must be placed on the interface rather than the class",
            "The database connection pool automatically suppresses rollbacks"
        ],
        "correct_answer_index": 0,
        "explanation": "Spring's default rollback policy triggers only on unchecked exceptions (RuntimeException / Error). For checked exceptions, '@Transactional(rollbackFor = Exception.class)' must be explicitly configured.",
        "marks": 2
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "What will this Java Stream pipeline produce?",
        "code_snippet": "List<String> names = Arrays.asList(\"alice\", \"bob\", \"anna\", \"charlie\");\nlong count = names.stream()\n    .filter(s -> s.startsWith(\"a\"))\n    .map(String::toUpperCase)\n    .count();\nSystem.out.println(count);",
        "options": ["1", "2", "4", "Compilation Error"],
        "correct_answer_index": 1,
        "explanation": "The filter keeps strings starting with 'a' ('alice', 'anna' = 2 items). The map converts them to uppercase, and count() returns 2.",
        "marks": 2
    },
    {
        "category": "SQL & DBMS",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "You need to find employees whose salary is greater than the average salary of their respective departments. Which SQL technique is most efficient?",
        "options": [
            "A correlated subquery or Window function: AVG(salary) OVER (PARTITION BY dept_id)",
            "A cross join between employees and departments with no join predicate",
            "Looping through individual rows using a client-side cursor",
            "Creating separate database tables for each salary tier"
        ],
        "correct_answer_index": 0,
        "explanation": "Window functions like 'AVG(salary) OVER (PARTITION BY dept_id)' calculate departmental averages in a single pass without expensive self-joins.",
        "marks": 2
    },

    # Advanced (2)
    {
        "category": "Multithreading & Concurrency",
        "difficulty": "advanced",
        "question_type": "conceptual",
        "question": "What is the primary mechanism of Java 21 Virtual Threads (Project Loom) compared to platform threads?",
        "options": [
            "Virtual threads are mapped 1:1 with kernel threads by the OS scheduler",
            "Virtual threads are lightweight user-mode threads managed by the JVM runtime, mounted on carrier platform threads during non-blocking operations",
            "Virtual threads eliminate all memory usage in the JVM",
            "Virtual threads run exclusively on GPU tensor cores"
        ],
        "correct_answer_index": 1,
        "explanation": "Virtual threads are M:N scheduled by the JVM on a small carrier thread pool. When a virtual thread blocks on socket/file I/O, it unmounts from its carrier thread, allowing millions of concurrent tasks with minimal memory footprint.",
        "marks": 2
    },
    {
        "category": "Debugging",
        "difficulty": "advanced",
        "question_type": "scenario",
        "question": "A production Spring Boot service experiences frequent 'OutOfMemoryError: Java heap space'. Analysis of the heap dump shows thousands of open DB connections and thread locals not cleaned up. What is the root architectural cause?",
        "options": [
            "ThreadLocal values placed on pooled threads were not removed via ThreadLocal.remove(), causing memory leaks across thread reuse cycles",
            "The JVM JIT compiler was disabled",
            "Garbage collection algorithms cannot run on 64-bit systems",
            "The database table lacked a primary key"
        ],
        "correct_answer_index": 0,
        "explanation": "Thread pools reuse threads. If ThreadLocal variables are not explicitly cleared via .remove() in a finally block, the objects remain strongly referenced by the thread's ThreadLocalMap indefinitely, leaking heap memory.",
        "marks": 2
    }
]

# -------------------------------------------------------------
# 2. Python Developer (25 Questions)
# -------------------------------------------------------------
CAREER_QUESTIONS["python-developer"] = [
    # Fundamentals (10)
    {
        "category": "Python Fundamentals",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Which of the following built-in data types in Python is mutable?",
        "options": ["tuple", "str", "list", "frozenset"],
        "correct_answer_index": 2,
        "explanation": "Lists can be modified in-place (append, extend, item assignment), while tuples, strings, and frozensets are immutable.",
        "marks": 1
    },
    {
        "category": "Data Types & Memory",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What does the expression 'a is b' evaluate in Python compared to 'a == b'?",
        "options": [
            "'a is b' tests object identity (memory address), while 'a == b' tests value equality",
            "'a is b' converts both variables to strings before comparison",
            "'a is b' is deprecated syntax replaced by 'a equals b'",
            "'a is b' checks if both variables have identical variable names"
        ],
        "correct_answer_index": 0,
        "explanation": "'is' checks whether both operands point to the exact same object in memory (id(a) == id(b)), whereas '==' checks whether their contents are logically equal.",
        "marks": 1
    },
    {
        "category": "Functions & Decorators",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "In Python, what is the purpose of the '*args' and '**kwargs' syntax in function signatures?",
        "options": [
            "Declares pointer variables as in C/C++",
            "Allows functions to accept an arbitrary number of positional (*args) and keyword (**kwargs) arguments",
            "Enforces strict type annotations at compile time",
            "Restricts function calls to asynchronous event loops only"
        ],
        "correct_answer_index": 1,
        "explanation": "*args packs excess positional arguments into a tuple, while **kwargs packs excess keyword arguments into a dictionary.",
        "marks": 1
    },
    {
        "category": "Object-Oriented Programming",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the role of the '__init__' method in a Python class?",
        "options": [
            "It allocates raw heap memory before the object is created",
            "It is an initializer method called automatically after instance creation to set initial attributes",
            "It is a class destructor executed when the instance is garbage collected",
            "It exports the class as a binary C module"
        ],
        "correct_answer_index": 1,
        "explanation": "__new__ creates the instance, and __init__ initializes instance state attributes right after creation.",
        "marks": 1
    },
    {
        "category": "Exception Handling",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "When does the 'else' block execute in a Python try-except-else-finally construct?",
        "options": [
            "Always, regardless of exceptions",
            "Only when an exception IS raised and handled",
            "Only when NO exception is raised in the try block",
            "Only when the finally block fails"
        ],
        "correct_answer_index": 2,
        "explanation": "In Python, the 'else' block runs only if the 'try' block completes without raising any exceptions.",
        "marks": 1
    },
    {
        "category": "Collections & Iterables",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is a key memory advantage of a Python generator function (using yield) over returning a list?",
        "options": [
            "Generators compute values lazily one at a time on demand rather than storing the entire sequence in memory",
            "Generators run on separate GPU threads",
            "Generators bypass the Python Global Interpreter Lock",
            "Generators are automatically saved to SQLite"
        ],
        "correct_answer_index": 0,
        "explanation": "Generators produce items lazily on each next() call, maintaining state with O(1) memory instead of allocating memory for entire collections.",
        "marks": 1
    },
    {
        "category": "File Handling & I/O",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Why is the 'with open(filename) as f:' pattern standard practice for file I/O in Python?",
        "options": [
            "It speeds up read operations by 10x",
            "It acts as a context manager that guarantees the file descriptor is closed properly even if exceptions occur",
            "It encrypts the file contents automatically",
            "It disables file locks across processes"
        ],
        "correct_answer_index": 1,
        "explanation": "Context managers (__enter__ and __exit__) guarantee deterministic resource cleanup, closing the file handle even upon unhandled exceptions.",
        "marks": 1
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "What is the average time complexity of checking membership 'x in s' when 's' is a Python set?",
        "options": ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
        "correct_answer_index": 0,
        "explanation": "Python sets are implemented using hash tables, giving average O(1) membership test time.",
        "marks": 1
    },
    {
        "category": "SQL & Database Access",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which SQL statement is used to remove all records from a table without logging individual row deletions?",
        "options": ["DELETE", "TRUNCATE", "DROP", "ALTER"],
        "correct_answer_index": 1,
        "explanation": "TRUNCATE quickly removes all rows by deallocating data pages, whereas DELETE processes rows individually and logs each deletion.",
        "marks": 1
    },
    {
        "category": "Python Fundamentals",
        "difficulty": "fundamentals",
        "question_type": "code_prediction",
        "question": "What is the output of the following list comprehension snippet?",
        "code_snippet": "nums = [1, 2, 3, 4, 5]\nres = [x * 2 for x in nums if x % 2 == 1]\nprint(res)",
        "options": [
            "[2, 4, 6, 8, 10]",
            "[2, 6, 10]",
            "[4, 8]",
            "[1, 3, 5]"
        ],
        "correct_answer_index": 1,
        "explanation": "The condition 'x % 2 == 1' filters odd numbers (1, 3, 5). Multiplying by 2 produces [2, 6, 10].",
        "marks": 1
    },

    # Intermediate (8)
    {
        "category": "Functions & Decorators",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is a Python decorator at a fundamental level?",
        "options": [
            "A syntax element that compiles functions into C dynamic libraries",
            "A callable that takes a function as an argument, adds behavior, and returns a modified callable",
            "A class destructor that frees memory",
            "A database trigger for SQLAlchemy"
        ],
        "correct_answer_index": 1,
        "explanation": "Decorators wrap functions or methods using closures, allowing cross-cutting concerns (logging, authentication, timing) to be added cleanly.",
        "marks": 1
    },
    {
        "category": "Data Types & Memory",
        "difficulty": "intermediate",
        "question_type": "debugging",
        "question": "What is the bug with mutable default arguments in Python functions?",
        "code_snippet": "def append_item(item, target_list=[]):\n    target_list.append(item)\n    return target_list",
        "options": [
            "The function throws a SyntaxError on definition",
            "The default list is instantiated once at function definition time, so state persists across subsequent function calls",
            "The target_list is converted into an immutable tuple",
            "The item parameter cannot accept strings"
        ],
        "correct_answer_index": 1,
        "explanation": "Default argument expressions are evaluated once when the function is defined. Reusing a mutable default like '[]' causes mutations to bleed into later calls. The standard fix is 'target_list=None'.",
        "marks": 1
    },
    {
        "category": "Object-Oriented Programming",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "In Python multiple inheritance, what algorithm determines the Method Resolution Order (MRO)?",
        "options": [
            "Depth-First Search (DFS) strictly",
            "C3 Linearization algorithm",
            "Breadth-First Search (BFS) strictly",
            "Randomized selection"
        ],
        "correct_answer_index": 1,
        "explanation": "Python uses the C3 Linearization algorithm to construct a consistent, monotonic Method Resolution Order (accessible via ClassName.__mro__).",
        "marks": 1
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "Which module in Python's standard library provides a double-ended queue with O(1) appends and pops from both ends?",
        "options": ["collections.deque", "queue.Queue", "heapq", "bisect"],
        "correct_answer_index": 0,
        "explanation": "collections.deque is implemented as a doubly-linked list of blocks, providing fast O(1) appends and pops from both the left and right.",
        "marks": 1
    },
    {
        "category": "Python Fundamentals",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is the Global Interpreter Lock (GIL) in standard CPython?",
        "options": [
            "A database lock that prevents writing to SQLite concurrently",
            "A mutex that prevents multiple native threads from executing Python bytecodes simultaneously in CPython",
            "A compiler optimization that pre-caches all functions",
            "A security module preventing unauthorized socket connections"
        ],
        "correct_answer_index": 1,
        "explanation": "The GIL is a mutex protecting access to Python objects, preventing multiple native threads from executing CPython bytecode at the same time and making CPU-bound multi-threading non-parallel without multiprocessing.",
        "marks": 1
    },
    {
        "category": "SQL & Database Access",
        "difficulty": "intermediate",
        "question_type": "scenario",
        "question": "When using an ORM like SQLAlchemy, what causes the notorious 'N+1 query problem' and how is it resolved?",
        "options": [
            "Iterating over N parent records and executing an individual lazy query for each child relationship; resolved via joinedload() or selectinload()",
            "Exceeding database connection pool limits; resolved by restarting the server",
            "Querying tables without primary keys; resolved by adding UUIDs",
            "Using raw SQL queries instead of ORM models"
        ],
        "correct_answer_index": 0,
        "explanation": "Lazy loading issues 1 query for the parent collection plus N individual queries for each parent's children. Eager loading (joinedload / selectinload) fetches data in 1 or 2 batch queries.",
        "marks": 1
    },
    {
        "category": "Collections & Iterables",
        "difficulty": "intermediate",
        "question_type": "code_prediction",
        "question": "What will be printed when unpacking this dictionary?",
        "code_snippet": "d1 = {'a': 1, 'b': 2}\nd2 = {'b': 99, 'c': 3}\nmerged = {**d1, **d2}\nprint(merged['b'])",
        "options": ["2", "99", "[2, 99]", "KeyError"],
        "correct_answer_index": 1,
        "explanation": "When unpacking dictionaries with duplicate keys, subsequent dictionaries overwrite preceding keys, so d2's 'b': 99 overrides d1's value.",
        "marks": 1
    },
    {
        "category": "Functions & Decorators",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "Why should functools.wraps be used inside custom decorator wrapper functions?",
        "options": [
            "It turns the decorated function into an asynchronous coroutine",
            "It preserves the original function's metadata, name, docstrings, and signature",
            "It automatically retries failed network connections",
            "It increases execution speed by 50%"
        ],
        "correct_answer_index": 1,
        "explanation": "@functools.wraps copies the __name__, __doc__, and module metadata from the original function to the wrapper, preventing debugging and introspection issues.",
        "marks": 1
    },

    # Practical / Code Output / Debugging (5)
    {
        "category": "Problem Solving",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "What is the output of this Python generator comprehension?",
        "code_snippet": "gen = (x * x for x in range(3))\nprint(list(gen))\nprint(list(gen))",
        "options": [
            "[0, 1, 4] and [0, 1, 4]",
            "[0, 1, 4] and []",
            "[] and [0, 1, 4]",
            "StopIteration Error"
        ],
        "correct_answer_index": 1,
        "explanation": "Generators are one-pass iterators. Once exhausted by the first list() call, subsequent iterations on the same generator yield an empty sequence [].",
        "marks": 2
    },
    {
        "category": "Debugging",
        "difficulty": "practical",
        "question_type": "debugging",
        "question": "What is the output of this closure late-binding trap?",
        "code_snippet": "funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])",
        "options": ["[0, 1, 2]", "[2, 2, 2]", "[0, 0, 0]", "IndexError"],
        "correct_answer_index": 1,
        "explanation": "Python closures bind variables late by reference, not value. When the loop completes, 'i' equals 2, so all closures evaluate to 2.",
        "marks": 2
    },
    {
        "category": "Problem Solving",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "You need to find the top K most frequent elements from a list of N numbers in O(N log K) time. Which approach is most suitable in Python?",
        "options": [
            "Count frequencies with collections.Counter and use heapq.nlargest(k, ...)",
            "Sort the entire list using list.sort() in O(N^2) time",
            "Perform a Cartesian product of all elements",
            "Loop through the list N times with count()"
        ],
        "correct_answer_index": 0,
        "explanation": "Counter builds frequency counts in O(N). heapq.nlargest uses a min-heap of size K, completing in O(N log K) time and optimal memory.",
        "marks": 2
    },
    {
        "category": "Data Structures & Algorithms",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "What is the result of applying copy.copy vs copy.deepcopy on this nested structure?",
        "code_snippet": "import copy\na = [[1, 2], [3, 4]]\nb = copy.copy(a)\nb[0][0] = 99\nprint(a[0][0])",
        "options": ["1", "99", "None", "IndexError"],
        "correct_answer_index": 1,
        "explanation": "Shallow copy creates a new outer list but copies references to the inner lists. Modifying b[0][0] alters the shared inner list in 'a'.",
        "marks": 2
    },
    {
        "category": "SQL & Database Access",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "In FastAPI with AsyncIO, which database library provides native asynchronous query execution without blocking the event loop?",
        "options": [
            "psycopg2 (synchronous)",
            "asyncpg with SQLAlchemy async session",
            "sqlite3 standard driver (blocking)",
            "csv module"
        ],
        "correct_answer_index": 1,
        "explanation": "asyncpg is a high-performance async PostgreSQL driver designed for asyncio, avoiding blocking worker threads in asynchronous web servers.",
        "marks": 2
    },

    # Advanced (2)
    {
        "category": "Python Fundamentals",
        "difficulty": "advanced",
        "question_type": "conceptual",
        "question": "What is the behavior of Python's memory management when cyclic object references occur (e.g. object A references B, and B references A)?",
        "options": [
            "Standard reference counting handles them immediately",
            "Reference counting alone fails to collect cyclic references; CPython's generational cyclic garbage collector detects and frees them",
            "Cyclic references trigger a FatalMemoryException crash",
            "Cycles are automatically moved to virtual swap memory"
        ],
        "correct_answer_index": 1,
        "explanation": "Reference counts never drop to 0 in isolated cycles. CPython uses a 3-generation cyclic garbage collector (gc module) to trace reachable objects and deallocate orphaned cyclic graphs.",
        "marks": 2
    },
    {
        "category": "Object-Oriented Programming",
        "difficulty": "advanced",
        "question_type": "conceptual",
        "question": "What purpose does a Python Metaclass serve?",
        "options": [
            "It acts as the class of a class, defining how classes themselves are constructed, validated, or transformed at definition time",
            "It is an alias for abstract base classes in the typing module",
            "It converts Python scripts into standalone Windows PE executables",
            "It executes functions on GPU CUDA hardware"
        ],
        "correct_answer_index": 0,
        "explanation": "Metaclasses (subclasses of 'type') intercept class definition, allowing automatic registration, field validation, and dynamic attribute injection before class instantiation.",
        "marks": 2
    }
]

# -------------------------------------------------------------
# 3. Data Analyst (25 Questions)
# -------------------------------------------------------------
CAREER_QUESTIONS["data-analyst"] = [
    # Fundamentals (10)
    {
        "category": "Excel & Spreadsheets",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "In modern Excel, which lookup function is the flexible successor to VLOOKUP that can look up values in any direction without column index limits?",
        "options": ["XLOOKUP", "HLOOKUP", "CONCATENATE", "OFFSET"],
        "correct_answer_index": 0,
        "explanation": "XLOOKUP looks both left and right, defaults to exact match, and does not break when columns are inserted or moved.",
        "marks": 1
    },
    {
        "category": "SQL & Query Optimization",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the output of an INNER JOIN between two tables?",
        "options": [
            "All rows from the left table and only matching rows from the right",
            "Only rows that have matching keys in both tables",
            "All rows from both tables regardless of matches",
            "Only rows with NULL primary keys"
        ],
        "correct_answer_index": 1,
        "explanation": "INNER JOIN returns exclusively the records where the join predicate evaluates to true in both participating tables.",
        "marks": 1
    },
    {
        "category": "Python for Data",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which Pandas function is used to inspect the first 5 rows of a DataFrame?",
        "options": ["df.first()", "df.head()", "df.peek()", "df.show(5)"],
        "correct_answer_index": 1,
        "explanation": "df.head(n=5) displays the first 5 rows of a Pandas DataFrame.",
        "marks": 1
    },
    {
        "category": "Pandas & NumPy",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the primary difference between a Pandas Series and a NumPy 1D array?",
        "options": [
            "A Pandas Series has an explicit, labeled index while a NumPy array uses zero-based integer indexing only",
            "NumPy arrays cannot store numerical floats",
            "Pandas Series can only hold boolean values",
            "NumPy arrays require internet access"
        ],
        "correct_answer_index": 0,
        "explanation": "A Pandas Series wraps a 1D NumPy array with an explicit index, providing index-aligned slicing, labeling, and missing value support.",
        "marks": 1
    },
    {
        "category": "Data Cleaning & Preprocessing",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "How should missing numerical values (NaN) in a skewed customer income dataset typically be imputed?",
        "options": [
            "Mean imputation, because mean is unaffected by extreme outliers",
            "Median imputation, because the median is robust to extreme skewness and outliers",
            "Always replace missing values with zero",
            "Delete the entire database table"
        ],
        "correct_answer_index": 1,
        "explanation": "Skewed distributions contain outliers that distort the arithmetic mean. The median represents the 50th percentile and resists outlier distortion.",
        "marks": 1
    },
    {
        "category": "Data Visualization",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Which chart type is best suited to display the distribution and quartile spread of continuous numeric data?",
        "options": ["Pie Chart", "Box Plot (Whisker Plot)", "Radar Chart", "Funnel Chart"],
        "correct_answer_index": 1,
        "explanation": "Box plots display minimum, first quartile, median, third quartile, maximum, and individual outliers, providing a concise summary of distribution shape.",
        "marks": 1
    },
    {
        "category": "Statistics & Probability",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What does a Pearson correlation coefficient of -0.85 indicate between two variables X and Y?",
        "options": [
            "No relationship whatsoever",
            "A strong negative linear relationship (as X increases, Y decreases)",
            "A weak positive relationship",
            "A deterministic causation where X causes Y"
        ],
        "correct_answer_index": 1,
        "explanation": "Pearson's r ranges from -1 to +1. A value of -0.85 denotes a strong negative linear correlation. (Correlation does not imply causation).",
        "marks": 1
    },
    {
        "category": "Power BI / Business Intelligence",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "In Power BI data modeling, what is the recommended schema architecture for fast analytical reporting?",
        "options": [
            "Normalized 3NF relational schema with 20 joined tables",
            "Star schema consisting of centralized Fact tables surrounded by Dimension tables",
            "A single unindexed flat CSV file",
            "Circular self-referencing relationship graph"
        ],
        "correct_answer_index": 1,
        "explanation": "Star schemas optimize Power BI's VertiPaq in-memory columnar engine, reducing join paths and boosting DAX measure performance.",
        "marks": 1
    },
    {
        "category": "SQL & Query Optimization",
        "difficulty": "fundamentals",
        "question_type": "mcq",
        "question": "Which SQL aggregate function computes the total number of non-null values in a column?",
        "options": ["SUM()", "COUNT()", "AVG()", "TOTAL()"],
        "correct_answer_index": 1,
        "explanation": "COUNT(column_name) returns the number of non-NULL values, while COUNT(*) counts all rows regardless of NULLs.",
        "marks": 1
    },
    {
        "category": "Analytical Thinking",
        "difficulty": "fundamentals",
        "question_type": "scenario",
        "question": "A sudden 25% drop in e-commerce checkout conversions is observed on Monday morning. What is the analyst's first diagnostic action?",
        "options": [
            "Recommend immediately lowering product prices by 50%",
            "Segment conversion data by browser, device, payment gateway, and traffic source to isolate the anomaly",
            "Delete old user sessions from the database",
            "Wait for next month's aggregate report"
        ],
        "correct_answer_index": 1,
        "explanation": "Segmenting the metric across dimensions (device, browser, gateway release) pinpoints whether the drop is localized to an engineering bug (e.g., iOS Safari checkout error) or a systemic issue.",
        "marks": 1
    },

    # Intermediate (8)
    {
        "category": "SQL & Query Optimization",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is the difference between the SQL window functions RANK() and DENSE_RANK()?",
        "options": [
            "RANK() skips subsequent rank numbers after ties (e.g., 1, 2, 2, 4), while DENSE_RANK() does not skip numbers (1, 2, 2, 3)",
            "DENSE_RANK() can only be used on string columns",
            "RANK() is non-deterministic",
            "DENSE_RANK() requires an INNER JOIN"
        ],
        "correct_answer_index": 0,
        "explanation": "RANK leaves gaps in sequence following tied values. DENSE_RANK assigns consecutive integers without gaps.",
        "marks": 1
    },
    {
        "category": "Pandas & NumPy",
        "difficulty": "intermediate",
        "question_type": "practical",
        "question": "In Pandas, what is the difference between df.loc and df.iloc?",
        "options": [
            "df.loc uses label-based indexing, whereas df.iloc uses zero-based integer positional indexing",
            "df.iloc is used only for SQL exports",
            "df.loc is deprecated in Pandas 2.0",
            "df.loc can only select a single row"
        ],
        "correct_answer_index": 0,
        "explanation": "loc references index labels and column names (e.g. df.loc['2023-01-01', 'Sales']), while iloc references integer positions (df.iloc[0, 1]).",
        "marks": 1
    },
    {
        "category": "Statistics & Probability",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "In A/B testing hypothesis evaluation, what does a p-value of 0.03 indicate when the significance threshold (alpha) is set to 0.05?",
        "options": [
            "The null hypothesis is retained as plausible",
            "There is a 97% probability the test variant is flawed",
            "The result is statistically significant; we reject the null hypothesis because p < alpha",
            "The sample size was insufficient"
        ],
        "correct_answer_index": 2,
        "explanation": "Since p (0.03) < alpha (0.05), the observed difference is unlikely under the null hypothesis, so we reject H0 in favor of the test variant.",
        "marks": 1
    },
    {
        "category": "Excel & Spreadsheets",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "In Excel Pivot Tables, what feature allows dynamic visual slicing and cross-filtering across multiple pivot tables simultaneously?",
        "options": ["Slicers with Report Connections", "Conditional Formatting Rules", "Goal Seek", "Data Validation Lists"],
        "correct_answer_index": 0,
        "explanation": "Slicers linked via Report Connections allow single-click interactive filtering across multiple pivot tables and charts.",
        "marks": 1
    },
    {
        "category": "Data Cleaning & Preprocessing",
        "difficulty": "intermediate",
        "question_type": "code_prediction",
        "question": "What does this Pandas operation accomplish?",
        "code_snippet": "df['clean_text'] = df['text'].str.strip().str.lower().str.replace(r'[^a-zA-Z0-9 ]', '', regex=True)",
        "options": [
            "Converts text to title case and adds punctuation",
            "Removes leading/trailing whitespaces, lowercases text, and strips all non-alphanumeric characters",
            "Deletes all rows containing letters",
            "Splits text into separate columns"
        ],
        "correct_answer_index": 1,
        "explanation": "strip() removes edge whitespace, lower() normalizes case, and regex replacement removes punctuation and special characters.",
        "marks": 1
    },
    {
        "category": "Power BI / Business Intelligence",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "In DAX (Power BI), what is the difference between a Calculated Column and a Measure?",
        "options": [
            "Calculated Columns compute row-by-row during data refresh and consume RAM, while Measures evaluate dynamically at query time based on user filter context",
            "Measures are saved into the underlying SQL database",
            "Calculated Columns cannot be filtered",
            "Measures only support text strings"
        ],
        "correct_answer_index": 0,
        "explanation": "Calculated columns add physical data to tables during refresh. Measures calculate on-the-fly respecting current visual slicer context.",
        "marks": 1
    },
    {
        "category": "Data Visualization",
        "difficulty": "intermediate",
        "question_type": "scenario",
        "question": "An executive asks to see sales performance over the past 5 years across 12 countries. Which visualization is most effective and prevents visual clutter?",
        "options": [
            "A single 3D pie chart with 60 slices",
            "A clean multi-series line chart or small-multiples area charts with clear country legends",
            "A 12-page PDF table of numbers",
            "A radar chart with 12 overlapping polygons"
        ],
        "correct_answer_index": 1,
        "explanation": "Multi-series line charts or small-multiples show temporal trends clearly without the occlusion and angle distortions of pie or radar charts.",
        "marks": 1
    },
    {
        "category": "Analytical Thinking",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is Simpson's Paradox in statistical data analysis?",
        "options": [
            "When two variables have zero correlation in all sub-groups",
            "A phenomenon where a trend appears in several different groups of data but disappears or reverses when these groups are combined",
            "When a chart uses too many colors",
            "When standard deviation exceeds the variance"
        ],
        "correct_answer_index": 1,
        "explanation": "Simpson's Paradox occurs when aggregate totals mask or reverse subgroup trends due to lurking confounding variables and unequal subgroup sizes.",
        "marks": 1
    },

    # Practical / Code Output / Debugging (5)
    {
        "category": "SQL & Query Optimization",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "Given an 'orders' table, write an analytical query to retrieve customer IDs who placed more than 3 orders in 2024:",
        "code_snippet": "SELECT customer_id, COUNT(*) AS total_orders\nFROM orders\nWHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'\nGROUP BY customer_id\nHAVING COUNT(*) > 3;",
        "options": [
            "The query is correct and efficiently uses WHERE for date filtering and HAVING for aggregate filtering",
            "HAVING should be replaced with WHERE COUNT(*) > 3",
            "GROUP BY customer_id is illegal with COUNT(*)",
            "order_date cannot be compared with string literals"
        ],
        "correct_answer_index": 0,
        "explanation": "This is standard, optimal SQL. WHERE filters the row partition by date, GROUP BY groups by customer, and HAVING filters the aggregated order count.",
        "marks": 2
    },
    {
        "category": "Pandas & NumPy",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "What is the result of grouping and aggregating this Pandas DataFrame?",
        "code_snippet": "import pandas as pd\ndf = pd.DataFrame({'Dept': ['Sales', 'Sales', 'IT', 'IT'], 'Score': [80, 90, 70, 70]})\nres = df.groupby('Dept')['Score'].mean()['IT']\nprint(res)",
        "options": ["70.0", "85.0", "75.0", "KeyError"],
        "correct_answer_index": 0,
        "explanation": "For Dept == 'IT', scores are 70 and 70. The mean is (70 + 70) / 2 = 70.0.",
        "marks": 2
    },
    {
        "category": "Data Cleaning & Preprocessing",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "You detect duplicate user records in a customer database where customer_id is identical but created_at timestamps differ. How do you keep only the most recent entry per customer in Pandas?",
        "options": [
            "df.sort_values('created_at').drop_duplicates(subset=['customer_id'], keep='last')",
            "df.drop_duplicates() with no arguments",
            "df.dropna()",
            "df.set_index('created_at').head()"
        ],
        "correct_answer_index": 0,
        "explanation": "Sorting by created_at ascending and specifying keep='last' guarantees that the most recent record for each customer_id is preserved while older duplicates are discarded.",
        "marks": 2
    },
    {
        "category": "Statistics & Probability",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "A warehouse quality check inspects 500 components and finds 25 defectives. What is the sample defect rate and standard error of proportion?",
        "options": [
            "Defect rate = 5% (0.05); SE = sqrt(0.05 * 0.95 / 500) ≈ 0.0097 (0.97%)",
            "Defect rate = 25%; SE = 5%",
            "Defect rate = 50%; SE = 1%",
            "Defect rate = 2.5%; SE = 10%"
        ],
        "correct_answer_index": 0,
        "explanation": "p = 25/500 = 0.05 (5%). Standard error of sample proportion = sqrt(p*(1-p)/n) = sqrt(0.05*0.95/500) = sqrt(0.000095) ≈ 0.0097 (0.97%).",
        "marks": 2
    },
    {
        "category": "Power BI / Business Intelligence",
        "difficulty": "practical",
        "question_type": "scenario",
        "question": "In Power BI, a total sales measure shows the same identical grand total across every row in a table visual rather than breaking down by category. What is the cause?",
        "options": [
            "The relationship between the Sales table and Category Dimension is inactive or disconnected in the data model",
            "The DAX formula uses UPPER() instead of LOWER()",
            "The table visual cannot display numbers",
            "The computer does not have a GPU"
        ],
        "correct_answer_index": 0,
        "explanation": "If dimension filters do not propagate to the fact table due to a missing, inactive, or unidirectional relationship, the measure evaluates in the unfiltered grand-total context for every row.",
        "marks": 2
    },

    # Advanced (2)
    {
        "category": "SQL & Query Optimization",
        "difficulty": "advanced",
        "question_type": "scenario",
        "question": "A reporting query joining a 50-million-row 'transactions' table with a 10-million-row 'users' table takes 90 seconds to run. Database EXPLAIN shows a 'Nested Loop' join and high disk spill. What structural optimization will yield the greatest improvement?",
        "options": [
            "Partition the transactions table by date (e.g. monthly) and ensure indexes exist on foreign keys to enable Hash Join or Merge Join with partition pruning",
            "Convert all integer columns to VARCHAR strings",
            "Add ORDER BY RAND() to the query",
            "Disable all foreign key constraints"
        ],
        "correct_answer_index": 0,
        "explanation": "Partitioning large analytical tables enables partition elimination (pruning), while proper indexing facilitates hash/merge joins and prevents unindexed nested loops.",
        "marks": 2
    },
    {
        "category": "Analytical Thinking",
        "difficulty": "advanced",
        "question_type": "scenario",
        "question": "A SaaS subscription business reports 5% monthly user churn, but MRR (Monthly Recurring Revenue) churn is -3% (net negative churn). How do you explain this to executives?",
        "options": [
            "Expansion revenue (upsells, cross-sells, higher tiers) from retained customers exceeded the revenue lost from churned customers",
            "The accounting system has a database error",
            "Net negative churn indicates the company will go bankrupt next month",
            "Customers are paying in foreign currency"
        ],
        "correct_answer_index": 0,
        "explanation": "Net negative churn is the holy grail of SaaS: existing cohorts expand their spend through seat additions and upsells faster than lost dollars from leaving users.",
        "marks": 2
    }
]

# -------------------------------------------------------------
# 4. Agentic AI Engineer (25 Questions)
# -------------------------------------------------------------
CAREER_QUESTIONS["agentic-ai-engineer"] = [
    # Fundamentals (10)
    {
        "category": "Machine Learning & LLM Core",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is an autonomous AI Agent in the context of modern LLM architectures?",
        "options": [
            "A static regex rule-based parser running on CPU",
            "An entity driven by an LLM core capable of perception, planning, dynamic tool execution, and iterative goal pursuit",
            "A database stored procedure that runs nightly",
            "A convolutional neural network for image segmentation"
        ],
        "correct_answer_index": 1,
        "explanation": "An AI agent utilizes a foundation model as its reasoning engine to perceive environment context, formulate plans, invoke external tools, and iteratively achieve objectives.",
        "marks": 1
    },
    {
        "category": "Prompt Engineering & Few-Shot",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the ReAct (Reason + Act) prompting pattern?",
        "options": [
            "A JavaScript UI rendering lifecycle hook",
            "An iterative loop where the LLM produces a Thought, executes an Action (tool call), inspects the Observation, and repeats until the final Answer",
            "A method for training binary classifiers",
            "A database replication protocol"
        ],
        "correct_answer_index": 1,
        "explanation": "ReAct interleaves reasoning traces ('Thought') with task-specific actions ('Action' / tool calls), allowing the model to incorporate observations from the environment before responding.",
        "marks": 1
    },
    {
        "category": "Embeddings & Vector Databases",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What does a text embedding model output when given an input string?",
        "options": [
            "A compressed ZIP binary file",
            "A dense numerical vector of fixed dimensions capturing semantic meaning",
            "A list of SQL table definitions",
            "An HTML webpage"
        ],
        "correct_answer_index": 1,
        "explanation": "Embedding models map natural language tokens into dense high-dimensional vectors (e.g. 768 or 1536 floats) where cosine distance reflects semantic similarity.",
        "marks": 1
    },
    {
        "category": "Tool Calling & Schema Validation",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "How do modern LLMs (e.g., Gemini, OpenAI) execute function calling / tool calling?",
        "options": [
            "The LLM executes arbitrary host shell scripts with root access",
            "The model is provided with JSON schemas of available tools; it generates a structured JSON payload specifying tool name and arguments for client-side execution",
            "The model directly accesses local computer RAM",
            "Tools can only be called using HTML form POST requests"
        ],
        "correct_answer_index": 1,
        "explanation": "The client sends tool signatures (JSON Schema). The model outputs structured tool call parameters. The client executes the function and returns the tool output back to the model context.",
        "marks": 1
    },
    {
        "category": "RAG Architecture",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What problem does Retrieval-Augmented Generation (RAG) primarily solve in LLM applications?",
        "options": [
            "It speeds up GPU clock frequencies",
            "It grounds LLM responses with proprietary, up-to-date domain knowledge, reducing hallucinations without full model retraining",
            "It compresses video files",
            "It replaces relational databases with Excel"
        ],
        "correct_answer_index": 1,
        "explanation": "RAG retrieves relevant domain chunks from external vector/keyword databases and inserts them into prompt context, ensuring accurate grounded generation.",
        "marks": 1
    },
    {
        "category": "LangChain & Core Abstractions",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the LCEL (LangChain Expression Language) pipe operator (|) used for?",
        "options": [
            "Bitwise OR operation on integers",
            "Composing modular runnables (prompts, models, parsers) into declarative execution chains",
            "Sending operating system IPC signals",
            "Opening Unix shell pipes"
        ],
        "correct_answer_index": 1,
        "explanation": "LCEL uses the pipe operator to chain components (PromptTemplate | ChatModel | OutputParser) with built-in streaming, batching, and async support.",
        "marks": 1
    },
    {
        "category": "Agent Memory & Persistence",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "What is the distinction between short-term context memory and long-term agent memory?",
        "options": [
            "Short-term memory lives in the LLM context window during an active conversation session; long-term memory is persisted in vector or relational databases across sessions",
            "Short-term memory uses Python integers; long-term memory uses Python floats",
            "Short-term memory is permanent; long-term memory is lost when the tab closes",
            "There is no difference in agent architectures"
        ],
        "correct_answer_index": 0,
        "explanation": "Short-term memory is the finite conversational context window. Long-term memory persists episodic and semantic experiences in vector stores or databases across independent invocations.",
        "marks": 1
    },
    {
        "category": "Python Programming for AI",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Why is Pydantic widely utilized in Agentic AI frameworks like LangChain and CrewAI?",
        "options": [
            "It compiles Python into C binary code",
            "It provides runtime type validation, serialization, and automatic JSON Schema generation for LLM tool calling",
            "It trains convolutional neural networks",
            "It replaces Docker containers"
        ],
        "correct_answer_index": 1,
        "explanation": "Pydantic BaseModel enforces strong schema validation on inputs/outputs and automatically generates compliant OpenAPI / JSON schemas needed for LLM tool definitions.",
        "marks": 1
    },
    {
        "category": "LangGraph & Cyclic State Graphs",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "Why was LangGraph developed to replace linear DAG chains for advanced agent workflows?",
        "options": [
            "Linear DAGs cannot execute loops, whereas real agents require cyclic state graphs with conditional looping for retries, reflection, and multi-step tool calls",
            "Linear DAGs are deprecated in Python 3.12",
            "LangGraph only works with offline Ollama models",
            "LangGraph compiles Python to assembly"
        ],
        "correct_answer_index": 0,
        "explanation": "Traditional chains are directed acyclic graphs (DAGs). Agents require cycles: reasoning -> tool execution -> observing output -> deciding whether to loop again or conclude.",
        "marks": 1
    },
    {
        "category": "Multi-Agent Collaboration",
        "difficulty": "fundamentals",
        "question_type": "conceptual",
        "question": "In multi-agent systems, what is a Supervisor / Orchestrator agent pattern?",
        "options": [
            "An agent that runs operating system backups",
            "A central agent that delegates tasks to specialized sub-agents (e.g. Researcher, Coder, Reviewer) and synthesizes their outputs",
            "An agent that writes unit tests only",
            "A human user typing in terminal"
        ],
        "correct_answer_index": 1,
        "explanation": "The supervisor pattern uses a central orchestrator model that inspects current goal state, determines which specialized subagent to invoke next, and synthesizes final deliverables.",
        "marks": 1
    },

    # Intermediate (8)
    {
        "category": "LangGraph & Cyclic State Graphs",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "In LangGraph, how is state managed and passed between graph nodes?",
        "options": [
            "Through global Linux environment variables",
            "Through a centralized TypedDict or Pydantic State object updated via reducer functions (e.g. operator.add)",
            "By writing temporary files to /tmp for each node",
            "State cannot be shared between nodes"
        ],
        "correct_answer_index": 1,
        "explanation": "LangGraph defines a central State schema. Each node receives the current state and returns partial state updates merged via defined reducers.",
        "marks": 1
    },
    {
        "category": "Tool Calling & Schema Validation",
        "difficulty": "intermediate",
        "question_type": "debugging",
        "question": "An LLM agent repeatedly outputs malformed JSON when calling a database tool, crashing the pipeline. What architectural pattern resolves this?",
        "options": [
            "Restarting the computer",
            "Implementing an Output-Fixing Parser / Schema Validator with self-healing retry logic that passes the error back to the LLM to correct itself",
            "Disabling tool calling completely",
            "Setting temperature to 2.0"
        ],
        "correct_answer_index": 1,
        "explanation": "Self-healing tool calling captures the validation error message and feeds it back to the model context with prompt guidance: 'Your tool arguments failed schema validation with error X. Please fix and regenerate.'",
        "marks": 1
    },
    {
        "category": "RAG Architecture",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is Hybrid Search in modern RAG systems?",
        "options": [
            "Searching on both Google and Yahoo",
            "Combining dense vector semantic search (HNSW/cosine) with sparse keyword search (BM25) and reciprocal rank fusion (RRF)",
            "Searching on both CPU and RAM simultaneously",
            "Using both Python and Java in one script"
        ],
        "correct_answer_index": 1,
        "explanation": "Hybrid search blends sparse keyword matching (crucial for exact IDs, codes, names) with dense semantic embeddings (conceptual match), using rerankers or RRF for optimal precision.",
        "marks": 1
    },
    {
        "category": "Agent Memory & Persistence",
        "difficulty": "intermediate",
        "question_type": "scenario",
        "question": "An autonomous customer support agent needs to remember customer preferences across sessions without overflowing the 8k context window. What memory strategy is optimal?",
        "options": [
            "Paste the entire 500-page historical customer chat transcript into every prompt",
            "Extract user facts into an entity graph / semantic memory store and retrieve relevant memories via vector search at session start",
            "Clear all memory after every user message",
            "Increase temperature to maximum"
        ],
        "correct_answer_index": 1,
        "explanation": "Extracting key user facts/entities into an episodic/semantic memory store (e.g. MemGPT/Zep style) allows targeted retrieval without wasting context window tokens.",
        "marks": 1
    },
    {
        "category": "Evaluation, Guardrails & Deployment",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is the purpose of Guardrails (e.g. NeMo Guardrails, Llama Guard) in production agent architectures?",
        "options": [
            "Preventing GPU overheating",
            "Intercepting inputs and outputs to enforce safety policies, prevent prompt injection, redact PII, and block unauthorized tool executions",
            "Encrypting SQLite database files",
            "Managing Git branches"
        ],
        "correct_answer_index": 1,
        "explanation": "Guardrails act as a programmable firewall around LLM agents, validating user inputs against jailbreaks/injections and checking outputs against safety/compliance rubrics.",
        "marks": 1
    },
    {
        "category": "Multi-Agent Collaboration",
        "difficulty": "intermediate",
        "question_type": "scenario",
        "question": "In a multi-agent system, Agent A (Coder) and Agent B (Reviewer) get stuck in an infinite critique loop where B keeps rejecting A's code for trivial formatting reasons. How do you prevent this?",
        "options": [
            "Set a deterministic max_iterations limit and implement consensus termination criteria or human-in-the-loop escalation",
            "Delete Agent B permanently",
            "Switch to an older LLM",
            "Increase thread priority in Windows"
        ],
        "correct_answer_index": 0,
        "explanation": "Cyclic agent graphs must have bounding recursion limits (max_iterations) and clear exit conditions to prevent infinite execution and runaway API cost.",
        "marks": 1
    },
    {
        "category": "Prompt Engineering & Few-Shot",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "What is Chain-of-Thought (CoT) reasoning and why does it improve agent planning?",
        "options": [
            "It chains multiple API keys together",
            "It prompts the model to break down complex multi-step reasoning into explicit sequential intermediate steps before generating the final conclusion",
            "It runs functions in parallel across nodes",
            "It reduces token cost by 90%"
        ],
        "correct_answer_index": 1,
        "explanation": "CoT allows the model to allocate computation across intermediate reasoning tokens ('Let's think step by step'), dramatically improving logical accuracy on complex planning tasks.",
        "marks": 1
    },
    {
        "category": "Embeddings & Vector Databases",
        "difficulty": "intermediate",
        "question_type": "conceptual",
        "question": "Why is Chunking Strategy critical for RAG accuracy in vector retrieval?",
        "options": [
            "Chunks that are too large dilute semantic specificity, while chunks that are too small lose necessary surrounding context",
            "Vector databases can only store exactly 10 characters per chunk",
            "Chunking is only needed for image files",
            "Chunking bypasses vector indexing"
        ],
        "correct_answer_index": 0,
        "explanation": "Chunk size and overlap determine retrieval quality: large chunks lower cosine relevance, while microscopic chunks lack sufficient context for the generator LLM.",
        "marks": 1
    },

    # Practical / Code Output / Debugging (5)
    {
        "category": "LangGraph & Cyclic State Graphs",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "In LangGraph, which method defines conditional routing from a node based on the state payload?",
        "options": [
            "graph.add_conditional_edges(source_node, routing_function, path_map)",
            "graph.add_straight_line()",
            "graph.terminate_immediately()",
            "graph.split_into_files()"
        ],
        "correct_answer_index": 0,
        "explanation": "add_conditional_edges inspects state returned by source_node, runs routing_function (e.g. should_continue), and maps the string return value to the next target node.",
        "marks": 2
    },
    {
        "category": "Tool Calling & Schema Validation",
        "difficulty": "practical",
        "question_type": "code_prediction",
        "question": "Given this Pydantic tool schema, what happens if an LLM generates {'location': 'Tokyo', 'days': 'five'}?",
        "code_snippet": "from pydantic import BaseModel, Field\nclass WeatherQuery(BaseModel):\n    location: str\n    days: int = Field(ge=1, le=14)",
        "options": [
            "Pydantic parses it successfully into 5",
            "Pydantic raises a ValidationError because 'five' cannot be cast to an integer, blocking invalid execution",
            "The computer crashes with a kernel panic",
            "The days field is set to None silently"
        ],
        "correct_answer_index": 1,
        "explanation": "Pydantic validates types at runtime. 'five' is not a valid integer, triggering a ValidationError that prevents corrupt downstream tool execution.",
        "marks": 2
    },
    {
        "category": "Evaluation, Guardrails & Deployment",
        "difficulty": "practical",
        "question_type": "practical",
        "question": "What is the RAG Triad framework used in Ragas for evaluating retrieval-augmented agents?",
        "options": [
            "Context Relevance, Groundedness (Faithfulness), and Answer Relevance",
            "Speed, Cost, and RAM usage",
            "CPU, GPU, and Disk throughput",
            "Precision, Recall, and F1 score only"
        ],
        "correct_answer_index": 0,
        "explanation": "The RAG Triad measures: 1) Context Relevance (did retrieval fetch relevant info?), 2) Faithfulness (is the answer grounded in context?), and 3) Answer Relevance (did it address the user query?).",
        "marks": 2
    },
    {
        "category": "Python Programming for AI",
        "difficulty": "practical",
        "question_type": "scenario",
        "question": "Your agent needs to execute 5 independent web search tool calls simultaneously. How do you implement this in asynchronous Python?",
        "options": [
            "Use asyncio.gather(*(search_tool(q) for q in queries)) to execute all 5 coroutines concurrently",
            "Execute them in a blocking 'for' loop sequentially",
            "Write a shell script to run them tomorrow",
            "Call time.sleep(5)"
        ],
        "correct_answer_index": 0,
        "explanation": "asyncio.gather schedules all 5 asynchronous tool coroutines onto the event loop concurrently, reducing total execution time to the slowest single query.",
        "marks": 2
    },
    {
        "category": "Multi-Agent Collaboration",
        "difficulty": "practical",
        "question_type": "scenario",
        "question": "In a Human-in-the-Loop (HITL) agent workflow, an agent wants to execute a sensitive action like 'DELETE_DATABASE_ROW'. How should the graph be constructed?",
        "options": [
            "Execute immediately without asking",
            "Use an interrupt / breakpoint before the sensitive action node, persisting state to a checkpointer until an authorized human approval token is received",
            "Hardcode credentials in the prompt",
            "Disable all security checks"
        ],
        "correct_answer_index": 1,
        "explanation": "LangGraph checkpointers support interrupt_before=['delete_node']. The agent pauses execution, surfaces the diff to the human reviewer, and resumes only upon explicit approval.",
        "marks": 2
    },

    # Advanced (2)
    {
        "category": "Evaluation, Guardrails & Deployment",
        "difficulty": "advanced",
        "question_type": "conceptual",
        "question": "What is the 'Lost in the Middle' phenomenon in LLM reasoning, and how does it impact long-context agents?",
        "options": [
            "Models attend best to information at the very beginning and very end of their input context, frequently overlooking critical facts placed in the middle of long prompts",
            "The model stops generating tokens at exactly 50% length",
            "GPU memory leaks halfway through execution",
            "The model switches languages randomly"
        ],
        "correct_answer_index": 0,
        "explanation": "Empirical research shows transformers suffer from a U-shaped attention curve: facts positioned in the middle of extensive context windows experience degraded retrieval and reasoning compared to boundary tokens.",
        "marks": 2
    },
    {
        "category": "Multi-Agent Collaboration",
        "difficulty": "advanced",
        "question_type": "conceptual",
        "question": "In autonomous multi-agent environments, what is the 'Agent Drift' phenomenon and how is it mitigated?",
        "options": [
            "Agents gradually drift away from system guidelines, conventions, and goals through compounding sub-agent summarization errors; mitigated via ground truth anchoring and supervisor verification gates",
            "The physical GPU server changes IP addresses",
            "The model weights change on disk dynamically",
            "The Python virtual environment deletes itself"
        ],
        "correct_answer_index": 0,
        "explanation": "Agent drift occurs as chained messages lose fidelity across multi-turn handoffs. Anchoring prompts with immutable guidelines and periodic supervisor alignment audits keeps the collective focused.",
        "marks": 2
    }
]


def _generate_career_questions(career_slug: str, competencies: list) -> list:
    """Generates 25 balanced questions for a career across its competencies."""
    questions = []
    
    # 10 Fundamentals (40%)
    for i in range(10):
        comp = competencies[i % len(competencies)]
        questions.append({
            "category": comp,
            "difficulty": "fundamentals",
            "question_type": "conceptual" if i % 2 == 0 else "mcq",
            "question": f"In {comp}, what is the fundamental principle governing core standard operations?",
            "options": [
                f"Establishing baseline protocols and maintaining consistent state across {comp} interfaces",
                f"Directly compiling binary instructions without intermediate runtime abstractions",
                f"Bypassing data validation layers to maximize raw throughput",
                f"Deleting previous execution checkpoints on every invocation"
            ],
            "correct_answer_index": 0,
            "explanation": f"Foundational mastery of {comp} requires adhering to standardized interface contracts, memory isolation, and deterministic state guarantees.",
            "marks": 1
        })

    # 8 Intermediate (30%)
    for i in range(8):
        comp = competencies[(i + 2) % len(competencies)]
        questions.append({
            "category": comp,
            "difficulty": "intermediate",
            "question_type": "scenario" if i % 2 == 0 else "conceptual",
            "question": f"When scaling systems utilizing {comp}, which architecture pattern minimizes latency and resource contention?",
            "options": [
                f"Asynchronous non-blocking I/O with partitioned connection pooling and structured caching in {comp}",
                f"Serializing all requests onto a single blocking main thread",
                f"Disabling database transactions and indexes completely",
                f"Polling the network continuously every 1 millisecond in a busy loop"
            ],
            "correct_answer_index": 0,
            "explanation": f"Optimal performance in {comp} demands asynchronous decoupling, non-blocking execution, and bounded resource pooling.",
            "marks": 1
        })

    # 5 Practical / Code / Debugging (20%)
    for i in range(5):
        comp = competencies[(i + 4) % len(competencies)]
        questions.append({
            "category": comp,
            "difficulty": "practical",
            "question_type": "debugging" if i % 2 == 0 else "code_prediction",
            "question": f"Identify the optimal fix for a high-concurrency race condition or performance bottleneck observed in {comp}:",
            "code_snippet": f"// Practical scenario in {comp}\nfunction processBatch(items) {{\n    // Concurrency boundary needing atomic validation\n    return items.map(async item => await service.execute(item));\n}}",
            "options": [
                f"Use Promise.all / asyncio.gather with rate-limited worker pools and atomic lock management in {comp}",
                f"Remove the await keyword and ignore all promises",
                f"Rerun the function in an infinite while(true) loop",
                f"Convert all asynchronous logic into hardcoded synchronous sleep calls"
            ],
            "correct_answer_index": 0,
            "explanation": f"High-volume batching in {comp} requires bounded concurrency (worker pools / semaphores) to prevent socket starvation and threadpool exhaustion.",
            "marks": 2
        })

    # 2 Advanced (10%)
    for i in range(2):
        comp = competencies[(i + 6) % len(competencies)]
        questions.append({
            "category": comp,
            "difficulty": "advanced",
            "question_type": "scenario",
            "question": f"Under distributed multi-region failover conditions in {comp}, how is strong consistency balanced with high availability according to the CAP theorem?",
            "options": [
                f"Implement quorum consensus (R + W > N) with multi-leader conflict-free replicated data types (CRDTs) or Raft state machines in {comp}",
                f"Assume network partitions can never occur in production clouds",
                f"Force all cross-region operations to write synchronously to a single disk file",
                f"Disable replication logs across availability zones"
            ],
            "correct_answer_index": 0,
            "explanation": f"Advanced distributed architectures for {comp} rely on quorum consensus algorithms (Raft/Paxos) and CRDTs to resolve network partition anomalies deterministically.",
            "marks": 2
        })

    return questions


def get_questions_for_career(career_slug: str, competencies: list = None) -> list:
    """Returns exactly 25 questions for the requested career."""
    if career_slug in CAREER_QUESTIONS and len(CAREER_QUESTIONS[career_slug]) >= 25:
        return CAREER_QUESTIONS[career_slug]
    
    # Generate tailored questions from competencies
    comp_list = competencies or [
        "Core Fundamentals", "Architecture & Design", "Data Structures & Algorithms",
        "Frameworks & APIs", "Database & Storage", "Testing & Debugging", "Performance Optimization"
    ]
    generated = _generate_career_questions(career_slug, comp_list)
    CAREER_QUESTIONS[career_slug] = generated
    return generated
