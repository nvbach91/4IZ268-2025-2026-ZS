import useStoreSettings from "../store/useStoreSettings.jsx";

export default function useStar(location) {
    const settings = useStoreSettings((state) => state.settings);
    const updateSettings = useStoreSettings((state) => state.updateSettings);
    const defaultLocation = useStoreSettings((state) => state.settings.defaultLocation);

    const isDefault = defaultLocation?.id && location?.id && defaultLocation.id === location.id;

    const handleStarClick = () => {
        if (!location?.id) return;

        updateSettings({
            ...settings,
            defaultLocation: {
                id: location.id,
                longitude: location.longitude,
                latitude: location.latitude,
                name: location.name,
            }
        });
    }

    const removeDefaultLocation = () => {
        updateSettings({...settings, defaultLocation: null});
    }

    return {
        isDefault,
        handleStarClick,
        removeDefaultLocation,
    }
}