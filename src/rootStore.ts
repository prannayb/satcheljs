import { map, ObservableMap } from 'mobx';

declare var global: any;

if (!global._satcheljsRootStore) {
    var rootStore: ObservableMap<any> = map({});
    global._satcheljsRootStore = rootStore;
}

export default global._satcheljsRootStore;
