/**
 * Asset Refresh Hook
 * 
 * This hook allows components to interact with the AssetRefreshContext
 * to manually trigger refreshes and check refresh status.
 */

import { useContext } from 'react';
import { AssetRefreshContext } from '../components/AssetRefreshProvider';

/**
 * Hook to access asset refresh functionality.
 * Returns an object with the following:
 * - triggerRefresh: Function to manually trigger an asset refresh
 * - isRefreshing: Boolean to indicate if a refresh is in progress
 * - lastRefreshTime: Timestamp of the last refresh
 */
export const useAssetRefresh = () => useContext(AssetRefreshContext);

export default useAssetRefresh;
