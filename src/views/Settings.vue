<template>
  <div class="flex flex-1 flex-col lg:p-10 sm:p-5 h-full">
    <div class="flex flex-col md:w-full lg:w-9/12 xl:w-8/12 mx-auto">
      <h1 class="text-2xl">Game Settings</h1>
      <div class="bg-sidebar-item p-5 rounded my-4">
        <div class="flex flex-col my-2">
          <div class="flex flex-col my-2">
            <label class="block uppercase tracking-wide text-white-700 text-xs font-bold mb-2" for="grid-last-name">
              Window Size
            </label>
            <div class="flex flex-row my-4 -mt-2">
              <div class="flex-col mt-auto mb-2 pr-1">
                <v-selectmenu :title="false" :query="false" :data="resolutionList" align="left" :value="resSelectedValue" @values="resChange">
                  <button class="appearance-none block w-full bg-green-400 text-white-600 border border-green-400 py-3 px-4 leading-tight cursor-pointer">
                  <font-awesome-icon icon="desktop" size="1x" class="cursor-pointer"/>
                </button>
                </v-selectmenu>
              </div>


              <ftb-input class="flex-col" label="Width" v-model="settingsCopy.width" :value="settingsCopy.width" @blur="doSave"/>
              <font-awesome-icon class="mt-auto mb-6 mx-1 text-gray-600" icon="times" size="1x" />
              <ftb-input class="flex-col" label="Height" v-model="settingsCopy.height" :value="settingsCopy.height" @blur="doSave"/>
            </div>
          </div>
          <ftb-toggle label="Keep launcher open when game starts: " :value="settingsCopy.keepLauncherOpen" @change="keepLauncherOpen"
            onColor="bg-primary-button"/>
          <ftb-slider label="Default Memory" v-model="settingsCopy.memory" :currentValue="settingsCopy.memory" minValue="512" :maxValue="settingsState.hardware.totalMemory" @change="doSave"
                      unit="MB" @blur="doSave" step="128"/>
          <ftb-input label="Custom Arguments" :value="settingsCopy.jvmargs" v-model="settingsCopy.jvmargs" @blur="doSave"/>
        </div>
      </div>
      <h1 class="text-2xl">App Settings</h1>
      <div class="bg-sidebar-item p-5 rounded my-4">
        <div class="flex flex-col my-2">
          <!-- <ftb-toggle label="Enable Analytics: " :value="settingsCopy.enableAnalytics" @change="enableAnalytics"
                      onColor="bg-primary-button"/> -->
          <!-- <ftb-toggle label="Enable Beta Launcher: " :value="settingsCopy.enableBeta" @change="enableBetaVersions"
                      onColor="bg-primary-button"/> -->
          <ftb-slider label="Download Threads" v-model="settingsCopy.threadLimit" :currentValue="settingsCopy.threadLimit" minValue="1" :maxValue="settingsState.hardware.totalCores * 2" @change="doSave"
                      unit="threads" @blur="doSave"/>
          <ftb-slider label="Download Speed" v-model="settingsCopy.speedLimit" :currentValue="(settingsCopy.speedLimit / 1000).toFixed(0)" minValue="0" :maxValue="250000" @change="doSave" step="256"
                      unit="mbps" maxValueLabel="250" @blur="doSave"/>
          <ftb-slider label="Cache Life" v-model="settingsCopy.cacheLife" :currentValue="settingsCopy.cacheLife" minValue="900" maxValue="15768000" @change="doSave"
                      unit="s" maxValueLabel="15768000" @blur="doSave" description="How long data will live before it dies"/>
        </div>
      </div>

      <h1 class="text-2xl">App Info</h1>
      <div class="bg-sidebar-item p-5 rounded my-4">
        <div class="flex flex-col my-2">
          <span>UI Version: {{webVersion}}</span>
          <span>App Version: {{appVersion}}</span>
          <button @click="goTo('/license')" class="appearance-none block w-1/6 bg-green-400 text-white-600 border border-green-400 py-3 px-4 leading-tight cursor-pointer">
            License
          </button>

          <span>???: Profit</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from 'vue-property-decorator';
import FTBInput from '@/components/FTBInput.vue';
import FTBToggle from '@/components/FTBToggle.vue';
import FTBButton from '@/components/FTBButton.vue';
import FTBSlider from '@/components/FTBSlider.vue';
import {State, Action} from 'vuex-class';
import {SettingsState, Settings} from '@/modules/settings/types';
import config from '@/config';

@Component({
    components: {
        'ftb-input': FTBInput,
        'ftb-toggle': FTBToggle,
        'ftb-slider': FTBSlider,
        'ftb-button': FTBButton,
    },
})
export default class SettingsPage extends Vue {
    @State('settings') public settingsState!: SettingsState;
    @Action('saveSettings', {namespace: 'settings'}) public saveSettings: any;
    @Action('loadSettings', {namespace: 'settings'}) public loadSettings: any;

    public settingsCopy: Settings = {
      width: 1720,
      height: 840,
      memory: 512,
      keepLauncherOpen: true,
      jvmargs: '',
      enableAnalytics: true,
      enableBeta: false,
      threadLimit: 2,
      speedLimit: 0,
      cacheLife: 5184000,
    };

    private resSelectedValue: string = '0';
    private webVersion: string = config.webVersion;
    private appVersion: string = config.appVersion;

    get resolutionList() {
      const resList = [];
      for (const [key, res] of Object.entries(this.settingsState.hardware.supportedResolutions)) {
        resList.push({id: key, name: res.width + 'x' + res.height, value: key});
      }
      return resList;
    }

    public goTo(page: string): void {
        // We don't care about this error!
        this.$router.push(page).catch((err) => { return; });
    }

    public resChange(data: any) {

      if (data && data.length) {
        if (this.resSelectedValue === data[0].value) { return; }
        this.resSelectedValue = data[0].value;
        this.settingsCopy.width = this.settingsState.hardware.supportedResolutions[data[0].id].width;
        this.settingsCopy.height = this.settingsState.hardware.supportedResolutions[data[0].id].height;

        this.doSave();
        return;
      }
    }

    public async created() {
      await this.loadSettings();
      // @ts-ignore
      // console.log(this.settingsState.settings);
      this.settingsCopy = {...this.settingsCopy, ...this.settingsState.settings};
      Object.keys(this.settingsCopy).forEach((key: string) => {
      // @ts-ignore
        if (this.settingsCopy[key] === 'true') {
      // @ts-ignore
          this.settingsCopy[key] = true;
      // @ts-ignore
        } else if (this.settingsCopy[key] === 'false') {
      // @ts-ignore
          this.settingsCopy[key] = false;
      // @ts-ignore
        } else if (key !== 'jvmargs' && !isNaN(this.settingsCopy[key])) {
      // @ts-ignore
          this.settingsCopy[key] = parseInt(this.settingsCopy[key], 10);
        }
      });
    }

    public keepLauncherOpen(value: boolean): void {
        this.settingsCopy.keepLauncherOpen = value;
        this.saveSettings(this.settingsCopy);
    }

    public enableBetaVersions(value: boolean): void {
        this.settingsCopy.enableBeta = value;
        this.saveSettings(this.settingsCopy);
    }

    public enableAnalytics(value: boolean): void {
        this.settingsCopy.enableAnalytics = value;
        this.saveSettings(this.settingsCopy);
    }

    public doSave() {
      this.saveSettings(this.settingsCopy);
    }
}
</script>