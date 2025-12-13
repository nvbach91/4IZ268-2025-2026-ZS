import { createApp } from "vue";
import { createPinia } from "pinia";
import "./index.css";
import "primeicons/primeicons.css";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import router from "./router";
import Aura from "@primeuix/themes/aura";
import Material from "@primeuix/themes/material";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Card from "primevue/card";
import Panel from "primevue/panel";
import ToggleSwitch from "primevue/toggleswitch";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row";
import Popover from "primevue/popover";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".dark-theme",
    },
  },
});
app.use(router);
app.use(ToastService);
app.component("Button", Button);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("Message", Message);
app.component("Card", Card);
app.component("Toast", Toast);
app.component("Panel", Panel);
app.component("Dialog", Dialog);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
app.component("Row", Row);
app.component("ToggleSwitch", ToggleSwitch);
app.component("Textarea", Textarea);
app.component("Popover", Popover);
app.mount("#app");
