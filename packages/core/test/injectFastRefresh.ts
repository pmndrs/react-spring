// React DOM only connects to the refresh runtime if it is injected before
// React DOM loads, so `setup.ts` imports this module first.
import RefreshRuntime from 'react-refresh/runtime'

RefreshRuntime.injectIntoGlobalHook(window)
