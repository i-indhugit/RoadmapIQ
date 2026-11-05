import React from 'react';
import GalaxyScenery from './GalaxyScenery';
import CityScenery from './CityScenery';
import KingdomScenery from './KingdomScenery';
import FortressScenery from './FortressScenery';
import CreativeScenery from './CreativeScenery';
import FinanceScenery from './FinanceScenery';
import DesignScenery from './DesignScenery';
import PeopleScenery from './PeopleScenery';

const SceneryRenderer = ({ sceneryType = 'galaxy', mapHeight = 1200 }) => {
  switch (sceneryType) {
    case 'galaxy':
      return <GalaxyScenery mapHeight={mapHeight} />;
    case 'city':
      return <CityScenery mapHeight={mapHeight} />;
    case 'kingdom':
      return <KingdomScenery mapHeight={mapHeight} />;
    case 'fortress':
      return <FortressScenery mapHeight={mapHeight} />;
    case 'creative':
      return <CreativeScenery mapHeight={mapHeight} />;
    case 'finance':
      return <FinanceScenery mapHeight={mapHeight} />;
    case 'design':
      return <DesignScenery mapHeight={mapHeight} />;
    case 'people':
      return <PeopleScenery mapHeight={mapHeight} />;
    default:
      return <KingdomScenery mapHeight={mapHeight} />;
  }
};

export default SceneryRenderer;

