import {generateRecommendation} from "../services/recommendationService.js";
import {useState} from "react";
import useStoreSettings from "../store/useStoreSettings.jsx";

export default function useAIRecommendation(weatherData) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [recommendationText, setRecommendationText] = useState("");

    const preferences = useStoreSettings((state) => state.settings);

    const getRecommendation = async () => {
        setIsGenerating(true);
        const result = await generateRecommendation(weatherData, preferences);
        setRecommendationText(result);
        setIsGenerating(false);
        setIsGenerated(true);
    }

    return {isGenerating, isGenerated, getRecommendation, recommendationText};

}
