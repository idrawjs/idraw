import { Context2dBase } from './base';
import { mixinsCompositing } from './compositing';

class Context extends Context2dBase {};

const Context2d = mixinsCompositing(Context);


export default Context2d;


