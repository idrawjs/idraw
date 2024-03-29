import type { LabData } from '../../src';
import { createButton } from './components/button';
import { createCheckbox } from './components/checkbox';

const data: LabData = {
  components: [
    createButton('001', { angle: 45 }),
    // createButton('001', {}),
    createButton('002', { x: 450 }),
    createCheckbox('001', { x: 50, y: 300 }),
    createCheckbox('002', { x: 450, y: 300 })
  ],
  modules: [],
  pages: []
};

export default data;
