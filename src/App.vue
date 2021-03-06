<template>
  <div id="app" class="theme-dark">
    <title-bar />
    <div class="container" v-if="websockets.socket.isConnected">
      <div id="nav" class="w-22 md:w-12">
        <sidebar />
      </div>
      <div class="content-container">
        <router-view />
        <div v-for="(modpack, index) in modpacks.installing" v-bind:key="index" >
          <!-- {{debugLog(modpack)}} -->
        </div>
        <div v-if="modpacks.installing != null">
          <div class="progress-bar" v-for="(modpack, index) in modpacks.installing" v-bind:key="index" >
            <div class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-if="modpack.error">Error installing {{modpack.pack.name}} - {{modpack.errorMessage}} - <button class="bg-orange-500 hover:bg-orange-600 text-white-600 font-bold py-2 px-4 inline-flex items-center cursor-pointer" @click="retry(modpack)"><span class="cursor-pointer">Retry?</span></button></div>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'INIT'">Creating environment...</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'API'">Downloading modpack metadata...</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'VANILLA'">Installing Vanilla Launcher...</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'FORGE'">Installing Forge...</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'DOWNLOADS'">Installing {{modpack.pack.name}} - {{modpack.progress.toFixed(2)}}% ({{(modpack.downloadSpeed / 1000000).toFixed(2)}} mbps)</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'POSTINSTALL'">Finalizing Installation...</p>
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}" v-else-if="modpack.stage == 'FINISHED'">Install Finished</p>
            <div class=" w-full h-full bg-grey-light justify-center -mr-200px">
              <div v-if="!modpack.error" class="h-full bg-primary-button text-xs leading-none py-1 text-white" v-bind:style="{'width': `${modpack.progress}%`, 'transition': 'width 0.5s ease'}"></div>
              <div v-else class="h-full bg-error-button text-xs leading-none py-1 text-white" v-bind:style="{'width': `100%`, 'transition': 'width 0.5s ease'}"></div>
            </div>
            <!-- <p class="pl-4" v-bind:style="{'position': 'absolute', 'z-index':'0'}" >Installing {{modpack.pack.name}} - {{modpack.progress}}%</p> -->
          </div>
        </div>
        <div v-if="$store.state && $store.state.alert != null">
          <div class="progress-bar" >
            <p class="pl-4 w-full" v-bind:style="{'position': 'absolute'}"><span class="font-bold">{{$store.state.alert.title}}</span> {{$store.state.alert.message}}</p>
            <div class="w-full h-full bg-grey-light justify-center -mr-200px">
              <div class="h-full text-xs leading-none py-1 text-white" :class="`bg-${$store.state.alert.type}-button`"></div>
            </div>
             <div class="alert-close" @click="hideAlert">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                <line x1="0.71" y1="11.12" x2="11.11" y2="0.72" stroke-width="2" />
                <line x1="0.77" y1="0.71" x2="11.18" y2="11.12" stroke-width="2" />
              </svg>
            </div>
            <!-- <p class="pl-4" v-bind:style="{'position': 'absolute', 'z-index':'0'}" >Installing {{modpack.pack.name}} - {{modpack.progress}}%</p> -->
          </div>
        </div>
      </div>
    </div>
    <div class="container flex pt-1 flex-wrap overflow-x-auto justify-center" v-else>
      <!-- TODO: Make this pretty -->
      <span
        v-bind:style="{'margin-top': '40vh'}"
      >Issue connecting to backend... Please wait or relaunch.</span>
    </div>
  </div>
</template>

<script lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import TitleBar from '@/components/TitleBar.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { SocketState } from './modules/websocket/types';
import { asyncForEach } from './utils';
import {
  Instance,
  ModpackState,
  InstallProgress,
} from './modules/modpacks/types';
import { RootState } from './types';

@Component({ components: { Sidebar, TitleBar } })
export default class App extends Vue {
  @State('websocket') public websockets!: SocketState;
  @State('modpacks') public modpacks!: ModpackState;
  @Action('sendMessage') public sendMessage: any;
  @Action('storeInstalledPacks', { namespace: 'modpacks' })
  public storePacks: any;
  @Action('updateInstall', { namespace: 'modpacks' })
  public updateInstall: any;
  @Action('finishInstall', { namespace: 'modpacks' })
  public finishInstall: any;
  @Action('loadSettings', { namespace: 'settings' }) public loadSettings: any;
  private haveLoaded: boolean = false;
  @Action('hideAlert') public hideAlert: any;
  @Watch('websockets', { deep: true })
  public onWebsocketsChange(newVal: SocketState, oldVal: SocketState) {
    if (this.websockets.socket.isConnected && !this.haveLoaded) {
      this.fetchStartData();
      this.haveLoaded = true;
    }
  }

  public fetchStartData() {
    this.sendMessage({
      payload: { type: 'installedInstances' },
      callback: (data: any) => {
        this.storePacks(data);
    }});
    this.loadSettings();
  }

  public retry(modpack: InstallProgress) {
    if (this.modpacks.installedPacks.filter((pack) => pack.uuid === modpack.instanceID).length > 0) {
      console.log('The instance already exists, assume an update.');
    } else {
      console.log('Instance does not exist, we can assume delete is fine');
      const foundPack = this.modpacks.installedPacks.filter((pack) => pack.uuid === modpack.instanceID)[0];
      this.sendMessage({payload: {type: 'uninstallInstance', uuid: foundPack.uuid}, callback: (data: any) => {
        this.sendMessage({payload: {type: 'installedInstances'}, callback: (data: any) => {
            this.storePacks(data);
            this.updateInstall({modpackID: foundPack.id, progress: 0});
            this.sendMessage({payload: {type: 'installInstance', id: foundPack.id, version: foundPack.versionId}, callback: (data: any) => {
              if (data.status === 'success') {
                this.sendMessage({payload: {type: 'installedInstances'}, callback: (data: any) => {
                  this.storePacks(data);
                  this.finishInstall({modpackID: foundPack.id, messageID: data.requestId});
                }});
              } else if (data.status === 'error') {
                this.updateInstall({modpackID: foundPack.id, messageID: data.requestId, error: true, errorMessage: data.message, instanceID: data.uuid});
              } else if (data.currentStage === 'POSTINSTALL') {
                // We don't care about this, keep progress bar showing.
              } else if (data.status === 'init') {
                this.updateInstall({modpackID: foundPack.id, messageID: data.requestId, stage: 'INIT', message: data.message});
              } else if (data.overallPercentage <= 100) {
                this.updateInstall({modpackID: foundPack.id, messageID: data.requestId, progress: data.overallPercentage, downloadSpeed: data.speed, downloadedBytes: data.currentBytes, totalBytes: data.overallBytes, stage: data.currentStage});
              }
              console.log(JSON.stringify(data));
            }});
          }});
      }});
    }
  }

  private debugLog(log: any) {
    console.log(log);
  }
}
</script>

<style lang="scss">
#app {
  margin: 0;
  font-family: 'Roboto Condensed', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  .container {
    height: calc(100% - 24px);
    display: flex;
    flex-direction: row;
    background-color: var(--color-background);
  }
}
#nav {
  height: 100%;
  &.md\:w-10 {
    min-width: 170.297px;
  }
  &.w-10p {
    width: 15%;
  }
}

.content-container {
  flex: 1;
  overflow-y: auto;
}
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  z-index: 4;
  width: 100%;
  background-color: var(--color-navbar);
  height: 40px;
}
.alert-close {
  position: fixed;
  stroke: #fff;
  right: 10px;
}
</style>
