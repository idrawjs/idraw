import type { DesignData } from '../../src';
import { createButton } from './components/button';
import { createCheckbox } from './components/checkbox';

const data: DesignData = {
  components: [createButton('001'), createButton('002'), createCheckbox('001'), createCheckbox('002')],
  modules: [],
  pages: []
};

export default data;
