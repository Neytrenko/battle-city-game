import GameObject from '../gameClasses/gameObject';
import EntitySkins from '../gameEngine/engineModules/constObjects/entitySkins';



class SteelWall extends GameObject {
    size = 50;
    skin = EntitySkins.SteelWall;
}

export default SteelWall;
