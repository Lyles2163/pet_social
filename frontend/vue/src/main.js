import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { 
  Button, 
  NoticeBar, 
  FloatingBubble, 
  Loading, 
  Search, 
  Form, 
  Field, 
  CellGroup, 
  NavBar ,
  showSuccessToast, 
  showFailToast,
  Grid, GridItem,
  Collapse, CollapseItem
} from 'vant';
import 'vant/lib/index.css';

const app = createApp(App)
app.config.devtools = false;
app.use(createPinia());
app.use(Button);
app.use(NoticeBar);
app.use(FloatingBubble);
app.use(Loading);
app.use(Search);
app.use(Form);
app.use(Field);
app.use(CellGroup);
app.use(NavBar);
app.use(Grid);
app.use(GridItem);
app.use(Collapse);
app.use(CollapseItem);
app.use(showSuccessToast);
app.use(showFailToast);
app.use(router)

app.mount('#app')