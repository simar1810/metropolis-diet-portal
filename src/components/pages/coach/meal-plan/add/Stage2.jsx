import useCurrentStateContext from "@/providers/CurrentStateContext";
import MonthlyMealCreation from "./MonthlyMealCreation";
import { Button } from "@/components/ui/button";
import {
	customWorkoutUpdateField,
	dailyMealRP,
	mealPlanCreationRP,
} from "@/config/state-reducers/custom-meal";
import WeeklyMealCreation from "./WeeklyMealCreation";
import CustomMealMetaData from "./CustomMealMetaData";
import SelectMeals from "./SelectMeals";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { sendData, uploadImage } from "@/lib/api";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { _throwError, format24hr_12hr } from "@/lib/formatter";
import { SquarePen } from "lucide-react";

export default function Stage2() {
	const [loading, setLoading] = useState(false);
	const { dispatch, ...state } = useCurrentStateContext();
	const component = selectWorkoutCreationComponent(state.mode);
	const { cache } = useSWRConfig();

	const router = useRouter();

	const mealsForSelectedType = useMemo(() => {
		const plan = state.selectedPlans?.[state.selectedPlan] ?? [];
		const planArray = Array.isArray(plan) ? plan : plan?.meals ?? [];
		const selected = planArray.find(
			(item) => item?.mealType === state.selectedMealType
		) || planArray[0];
		return Array.isArray(selected?.meals) ? selected.meals : [];
	}, [state.selectedPlans, state.selectedPlan, state.selectedMealType]);

	const totals = useMemo(() => {
		const selectedOption = mealsForSelectedType.find(
			(opt) => opt.optionType === state.selectedOption
		) || mealsForSelectedType[0] || {};
		const dishes = Array.isArray(selectedOption?.dishes) ? selectedOption.dishes : [];
		const parseNum = (val) => {
			if (typeof val === "number") return Number.isFinite(val) ? val : 0;
			if (typeof val === "string") {
				const n = parseFloat(val.replace(/,/g, ""));
				return Number.isFinite(n) ? n : 0;
			}
			return 0;
		};

		// Helper to check if object is a dish
		const isDishObject = (obj) => {
			if (!obj || typeof obj !== "object") return false;
			return "dish_name" in obj || "description" in obj || "calories" in obj;
		};

		// Recursive function to extract nutritional values from nested structures
		const extractNutrition = (item, acc) => {
			// If it's a dish object, extract its nutrition
			if (isDishObject(item)) {
				const caloriesVal =
					typeof item?.calories === "object"
						? item?.calories?.total
						: item?.calories;
				const proteinVal = item?.protein ?? item?.calories?.proteins;
				const carbsVal = item?.carbohydrates ?? item?.calories?.carbs;
				const fatsVal = item?.fats ?? item?.calories?.fats;

				acc.calories += parseNum(caloriesVal);
				acc.protein += parseNum(proteinVal);
				acc.carbohydrates += parseNum(carbsVal);
				acc.fats += parseNum(fatsVal);
				return acc;
			}

			// If it's an object (like nested structures), traverse it
			if (typeof item === "object" && !Array.isArray(item) && item !== null) {
				Object.values(item).forEach(value => {
					if (Array.isArray(value)) {
						// For arrays, only process the first option (choice arrays)
						if (value.length > 0) {
							// Check if first item has nested items (combo structure)
							if (value[0]?.items && Array.isArray(value[0].items)) {
								value[0].items.forEach(nestedItem => extractNutrition(nestedItem, acc));
							} else {
								extractNutrition(value[0], acc);
							}
						}
					} else if (typeof value === "object" && value !== null) {
						extractNutrition(value, acc);
					}
				});
			}

			return acc;
		};

		return dishes.reduce(
			(acc, meal) => extractNutrition(meal, acc),
			{ calories: 0, protein: 0, carbohydrates: 0, fats: 0 }
		);
	}, [mealsForSelectedType, state.selectedOption]);

	async function saveCustomWorkout({
		draft
	}) {
		try {
			// check the conditions only if creation type is not a draft.
			if (!draft) {
				for (const field of ["title", "description"]) {
					if (!Boolean(state[field]))
						_throwError(`${field} - for the meal plan is required!`);
				}

				for (const day in state.selectedPlans) {
					const dayPlan = normalizePlanForSave(state.selectedPlans[day]);
					const mealTypesArray = Array.isArray(dayPlan) ? dayPlan : [];
					if (mealTypesArray.length === 0)
						_throwError(`There are no plans assigned for the day - ${day}!`);
					for (const mealType of mealTypesArray) {
						if (!mealType.meals || mealType.meals?.length === 0)
							_throwError(
								`On ${day}, for ${mealType.mealType || "First Meal Type"
								} at least one meal should be assigned!`
							);
						if (["lunch", "dinner"].includes(mealType.mealType)) continue
						for (const option of mealType.meals) {
							if (!Array.isArray(option?.dishes) || option.dishes.length === 0) {
								_throwError(`On ${day}, for ${mealType.mealType} at least one dish is required in ${option.optionType || "an option"}`);
							}
							for (const dish of option.dishes) {
								delete dish.isNew;
								if (!dish.time && !dish.meal_time)
									_throwError(
										`Time should be selected for all the meals. Not provided for ${mealType.mealType}`
									);
								if (!dish.dish_name)
									_throwError(
										`Dish should be selected for all the meals. Not provided for ${mealType.mealType}`
									);
								dish.meal_time = format24hr_12hr(dish.time || dish.meal_time);
							}
						}
					}
				}
			}

			if (["new", "copy_edit"].includes(state.creationType)) {
				newWorkout({ draft });
			} else if (["edit"].includes(state.creationType)) {
				editWorkout({ draft });
			}
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		}
	}

	async function editWorkout({ draft }) {
		try {
			setLoading(true);
			let thumbnail;
			if (state.file) {
				const toastId = toast.loading("Uploading Thumbnail...");
				thumbnail = await uploadImage(state.file);
				dispatch(customWorkoutUpdateField("image", thumbnail.img));
				toast.dismiss(toastId);
			}
			const plans = {};
			for (const key in state.selectedPlans) {
				const toastId = toast.loading(`Creating Meal Plan - ${key}...`);
				let createdMealPlan;
				if (state.editPlans[key]) {
					createdMealPlan = await sendData(
						`app/update-custom-plan?id=${state.editPlans[key]}`,
						mealPlanCreationRP(normalizePlanForSave(state.selectedPlans[key])),
						"PUT"
					);
				} else {
					createdMealPlan = await sendData(
						"app/create-custom-plan",
						mealPlanCreationRP(normalizePlanForSave(state.selectedPlans[key])),
						"POST"
					);
				}
				if (createdMealPlan.status_code !== 200) {
					toast.dismiss(toastId);
					_throwError(createdMealPlan.message);
				}
				plans[key] =
					createdMealPlan?.data?.planId || createdMealPlan?.data?._id;
				toast.dismiss(toastId);
			}

			const toastId = toast.loading("Creating The Custom Meal Plan...");
			const formData = dailyMealRP(state);
			const response = await sendData(
				`app/meal-plan/custom`,
				{
					...formData,
					image: thumbnail?.img || state.image || state.thumbnail,
					plans: state.selectedPlans,
					id: state.id,
					planIds: plans,
					draft
				},
				"PUT"
			);
			toast.dismiss(toastId);
			if (response.status_code !== 200) _throwError(response.message);
			toast.success(response.message);
			window.location.href = `/coach/meals/list-custom/${state.id}`;
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		} finally {
			setLoading(false);
		}
	}

	async function newWorkout({ draft }) {
		try {
			setLoading(true);
			const plans = {};
			let toastId;
			for (const key in state.selectedPlans) {
				toastId = toast.loading(`Creating Meal Plan - ${key}...`);
				const createdMealPlan = await sendData(
					"app/create-custom-plan",
					mealPlanCreationRP(normalizePlanForSave(state.selectedPlans[key]))
				);
				if (createdMealPlan.status_code !== 200) {
					toast.dismiss(toastId);
					_throwError(createdMealPlan.message);
				}
				plans[key] = createdMealPlan?.data?.planId;
				toast.dismiss(toastId);
			}

			let thumbnail;
			if (state.file) {
				const uploadToastId = toast.loading("Uploading Thumbnail...");
				thumbnail = await uploadImage(state.file);
				dispatch(customWorkoutUpdateField("image", thumbnail.img));
				toast.dismiss(uploadToastId);
			}

			toastId = toast.loading("Creating The Custom Meal Plan...");
			const formData = dailyMealRP(state);
			const response = await sendData(`app/meal-plan/custom`, {
				...formData,
				image: thumbnail?.img || state.image || state.thumbnail,
				plans,
				draft
			});
			toast.dismiss(toastId);
			if (response.status_code !== 200) _throwError(response.message);
			cache.delete("custom-meal-plans");
			toast.success(response.message);
			localStorage.removeItem("aiMealPlan");
			router.push(`/coach/meals/list-custom?mode=${state.mode}`);
		} catch (error) {
			toast.error(error.message || "Something went wrong!");
		} finally {
			setLoading(false);
		}
	}

	const targetTotals = state.aiResponseRaw?.plan?.[state.selectedPlan]?.totals || state.aiResponseRaw?.plan?.daily?.totals || {};

	const currentDailyTotals = useMemo(() => {
		const plan = state.selectedPlans?.[state.selectedPlan] ?? [];
		const planArray = Array.isArray(plan) ? plan : plan?.meals ?? [];
		const parseNum = (val) => {
			if (typeof val === "number") return Number.isFinite(val) ? val : 0;
			if (typeof val === "string") {
				const n = parseFloat(val.replace(/,/g, ""));
				return Number.isFinite(n) ? n : 0;
			}
			return 0;
		};

		// Helper to check if object is a dish
		const isDishObject = (obj) => {
			if (!obj || typeof obj !== "object") return false;
			return "dish_name" in obj || "description" in obj || "calories" in obj;
		};

		// Recursive function to extract nutritional values from nested structures
		const extractNutrition = (item, acc) => {
			// If it's a dish object, extract its nutrition
			if (isDishObject(item)) {
				const caloriesVal = typeof item?.calories === "object" ? item?.calories?.total : item?.calories;
				const proteinVal = item?.protein ?? item?.calories?.proteins;
				const carbsVal = item?.carbohydrates ?? item?.calories?.carbs;
				const fatsVal = item?.fats ?? item?.calories?.fats;

				acc.calories += parseNum(caloriesVal);
				acc.protein += parseNum(proteinVal);
				acc.carbohydrates += parseNum(carbsVal);
				acc.fats += parseNum(fatsVal);
				return acc;
			}

			// If it's an object (like nested structures), traverse it
			if (typeof item === "object" && !Array.isArray(item) && item !== null) {
				Object.values(item).forEach(value => {
					if (Array.isArray(value)) {
						// For arrays, only process the first option (choice arrays)
						if (value.length > 0) {
							// Check if first item has nested items (combo structure)
							if (value[0]?.items && Array.isArray(value[0].items)) {
								value[0].items.forEach(nestedItem => extractNutrition(nestedItem, acc));
							} else {
								extractNutrition(value[0], acc);
							}
						}
					} else if (typeof value === "object" && value !== null) {
						extractNutrition(value, acc);
					}
				});
			}

			return acc;
		};

		return planArray.reduce((acc, mealType) => {
			const firstOption = Array.isArray(mealType?.meals) ? mealType.meals[0] : null;
			if (!firstOption) return acc;
			const dishes = Array.isArray(firstOption?.dishes) ? firstOption.dishes : [];
			dishes.forEach(dish => extractNutrition(dish, acc));
			return acc;
		}, { calories: 0, protein: 0, carbohydrates: 0, fats: 0 });
	}, [state.selectedPlans, state.selectedPlan]);

	const pending = {
		calories: (targetTotals.calories || 0) - currentDailyTotals.calories,
		protein: (targetTotals.protein || 0) - currentDailyTotals.protein,
		fats: (targetTotals.fats || 0) - currentDailyTotals.fats,
		carbohydrates: (targetTotals.carbohydrates || 0) - currentDailyTotals.carbohydrates
	};

	return (
		<div>
			<div className="flex flex-col gap-y-4">
				<MealPlanStats
					plan={state.selectedPlans[state.selectedPlan]}
					target={targetTotals}
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 md:divide-x-2">
					<CustomMealMetaData />
					<div className="md:pl-8">
						{component}
						<SelectMeals
							key={`${state.selectedPlan}${state.selectedMealType}`}
						/>
						<div className="mt-4 rounded-lg border px-4 py-2 text-sm text-muted-foreground grid grid-cols-4 gap-6">
							<div>{totals.calories.toFixed(2)} Calories</div>
							<div>{totals.protein.toFixed(2)} Protein</div>
							<div>{totals.fats.toFixed(2)} Fats</div>
							<div>{totals.carbohydrates.toFixed(2)} Carbs</div>
						</div>
						{/* <div className="mt-4 flex flex-col gap-2">
							{pending.calories > 0 && <div className="text-sm font-bold text-red-500">Pending Calories: {pending.calories.toFixed(2)}</div>}
							{pending.protein > 0 && <div className="text-sm font-bold text-red-500">Pending Protein: {pending.protein.toFixed(2)}</div>}
							{pending.fats > 0 && <div className="text-sm font-bold text-red-500">Pending Fats: {pending.fats.toFixed(2)}</div>}
							{pending.carbohydrates > 0 && <div className="text-sm font-bold text-red-500">Pending Carbs: {pending.carbohydrates.toFixed(2)}</div>}
						</div> */}
						<div className="mt-10 grid grid-cols-1 gap-4">
							{/* <Button
								disabled={loading}
								onClick={() => saveCustomWorkout({ draft: true })}
							>
								<SquarePen />
								Draft
							</Button> */}
							<Button
								disabled={loading}
								variant="wz"
								onClick={() => saveCustomWorkout({ draft: false })}
							>
								Save Meal
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function selectWorkoutCreationComponent(mode) {
	switch (mode) {
		case "daily":
			return (() => <></>)();
		case "weekly":
			return <WeeklyMealCreation />;
		case "monthly":
			return <MonthlyMealCreation />;
	}
}

function normalizePlanForSave(plan) {
	const planArray = Array.isArray(plan) ? plan : plan?.meals ?? [];
	return planArray.map((entry, idx) => ({
		mealType: entry?.mealType || `meal_${idx + 1}`,
		meals: Array.isArray(entry?.meals)
			? entry.meals.map((opt, optIdx) => ({
				optionType: opt?.optionType || `option_${optIdx + 1}`,
				dishes: Array.isArray(opt?.dishes) ? opt.dishes : Array.isArray(opt?.meals) ? opt.meals : [],
			}))
			: [{ optionType: "option_1", dishes: [] }],
		defaultMealTiming: entry?.defaultMealTiming || "",
	}));
}

function MealPlanStats({ plan, target }) {
	const currentTotals = useMemo(() => {
		const planArray = Array.isArray(plan) ? plan : plan?.meals ?? [];

		const parseNum = (val) => {
			if (typeof val === "number") return Number.isFinite(val) ? val : 0;
			if (typeof val === "string") {
				const n = parseFloat(val.replace(/,/g, ""));
				return Number.isFinite(n) ? n : 0;
			}
			return 0;
		};

		// Helper to check if object is a dish
		const isDishObject = (obj) => {
			if (!obj || typeof obj !== "object") return false;
			return "dish_name" in obj || "description" in obj || "calories" in obj;
		};

		// Recursive function to extract nutritional values from nested structures
		const extractNutrition = (item, acc) => {
			// If it's a dish object, extract its nutrition
			if (isDishObject(item)) {
				const caloriesVal = typeof item?.calories === "object" ? item?.calories?.total : item?.calories;
				const proteinVal = item?.protein ?? item?.calories?.proteins;
				const carbsVal = item?.carbohydrates ?? item?.calories?.carbs;
				const fatsVal = item?.fats ?? item?.calories?.fats;

				acc.calories += parseNum(caloriesVal);
				acc.protein += parseNum(proteinVal);
				acc.carbohydrates += parseNum(carbsVal);
				acc.fats += parseNum(fatsVal);
				return acc;
			}

			// If it's an object (like nested structures), traverse it
			if (typeof item === "object" && !Array.isArray(item) && item !== null) {
				Object.values(item).forEach(value => {
					if (Array.isArray(value)) {
						// For arrays, only process the first option (choice arrays)
						if (value.length > 0) {
							// Check if first item has nested items (combo structure)
							if (value[0]?.items && Array.isArray(value[0].items)) {
								value[0].items.forEach(nestedItem => extractNutrition(nestedItem, acc));
							} else {
								extractNutrition(value[0], acc);
							}
						}
					} else if (typeof value === "object" && value !== null) {
						extractNutrition(value, acc);
					}
				});
			}

			return acc;
		};

		return planArray.reduce((acc, mealType) => {
			// Use the first option for calculation as it represents the default/primary choice
			const firstOption = Array.isArray(mealType?.meals) ? mealType.meals[0] : null;
			if (!firstOption) return acc;

			const dishes = Array.isArray(firstOption?.dishes) ? firstOption.dishes : [];
			dishes.forEach(dish => extractNutrition(dish, acc));
			return acc;
		}, { calories: 0, protein: 0, carbohydrates: 0, fats: 0 });
	}, [plan]);

	const getDiff = (current, target) => {
		const diff = (target || 0) - current;
		return diff;
	};

	// Helper to render a stat block
	const renderStat = (label, current, target) => {
		const diff = getDiff(current, target);
		const isDeficit = diff > 0;
		// If no target, just show current
		if (!target) return <div>{current.toFixed(2)} {label}</div>;

		return (
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<span className="text-xs text-muted-foreground">Goal:</span>
					<span className="text-sm font-medium">{target}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-xs text-muted-foreground">Current:</span>
					<span className="text-sm font-medium">{current.toFixed(2)}</span>
				</div>
				{diff !== 0 && (
					<div className={`flex justify-between items-center text-xs font-semibold ${isDeficit ? 'text-orange-500' : 'text-blue-500'}`}>
						<span>{isDeficit ? 'Pending:' : 'Excess:'}</span>
						<span>{Math.abs(diff).toFixed(2)}</span>
					</div>
				)}
				<div className="text-xs font-bold uppercase tracking-wider text-center mt-1 border-t pt-1">{label}</div>
			</div>
		);
	};

	return (
		<div className="bg-white rounded-[10px] p-4 border">
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				{renderStat("Calories", currentTotals.calories, target?.calories)}
				{renderStat("Protein", currentTotals.protein, target?.protein)}
				{renderStat("Fats", currentTotals.fats, target?.fats)}
				{renderStat("Carbs", currentTotals.carbohydrates, target?.carbohydrates)}
			</div>
		</div>
	);
}
