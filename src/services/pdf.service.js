import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { compress } from "compress-pdf";

export class PdfService {
  static LOGO_BASE64 = null;
  static QR_CODE_BASE64 = null;
  static PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
  static CLOCK_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6V12L16 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  static async initImages() {
    if (!this.LOGO_BASE64) {
      try {
        const logoBuffer = await sharp(path.join(process.cwd(), "public", "image 130.png"))
          .resize(250, null, { withoutEnlargement: true })
          .png({ compressionLevel: 9, palette: true })
          .toBuffer();
        this.LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      } catch (error) {
        console.error("Error loading logo:", error);
        try {
          const originalLogo = fs.readFileSync(path.join(process.cwd(), "public", "image 130.png"));
          this.LOGO_BASE64 = `data:image/png;base64,${originalLogo.toString("base64")}`;
        } catch (e) {
          this.LOGO_BASE64 = this.PLACEHOLDER_IMAGE;
        }
      }
    }

    if (!this.QR_CODE_BASE64) {
      try {
        const qrBuffer = await sharp(path.join(process.cwd(), "public", "Untitled design (4).png"))
          .resize(150, 150, { fit: 'inside' })
          .png({ compressionLevel: 9 })
          .toBuffer();
        this.QR_CODE_BASE64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;
      } catch (error) {
        console.error("Error loading QR code:", error);
        try {
          const originalQr = fs.readFileSync(path.join(process.cwd(), "public", "Untitled design (4).png"));
          this.QR_CODE_BASE64 = `data:image/png;base64,${originalQr.toString("base64")}`;
        } catch (e) {
          this.QR_CODE_BASE64 = this.PLACEHOLDER_IMAGE;
        }
      }
    }
  }

  static MEAL_PRIORITY_ORDER = [
    "when_you_wake_up", "wake_up", "wakeup", "pre_wakeup",
    "before_breakfast", "pre_breakfast",
    "breakfast",
    "mid_day_meal", "midday_meal", "lunch",
    "post_lunch_snack", "post_lunch", "postlunch",
    "evening_snack", "snack",
    "dinner", "night",
    "after_dinner",
    "before_sleep", "pre_sleep",
  ];

  static normalizePlanTableMealsForRendering(rawMeals) {
    const meals = Array.isArray(rawMeals)
      ? (rawMeals)
      : [];

    const fieldKeys = new Set([
      "dish_name",
      "dishName",
      "description",
      "meal_time",
      "mealTime",
      "serving_size",
      "servingSize",
      "calories",
      "protein",
      "carbohydrates",
      "fats",
      "image",
    ]);

    const normalizeOne = (meal) => {
      const options = Array.isArray(meal?.meals) ? meal.meals : [];
      const looksFieldSplit =
        options.length >= 4 &&
        options.every(
          (o) =>
            o &&
            typeof o === "object" &&
            typeof o.optionType === "string" &&
            fieldKeys.has(o.optionType) &&
            Array.isArray(o.dishes) &&
            o.dishes.length === 1
        );

      if (looksFieldSplit) {
        const pick = (key) => {
          const opt = options.find((o) => String(o.optionType) === key);
          const d = Array.isArray(opt?.dishes) ? opt.dishes[0] : null;
          return d && typeof d === "object" ? d.dish_name ?? "" : "";
        };

        const reconstructed = {
          dish_name: String(pick("dish_name") || pick("dishName") || ""),
          description: String(pick("description") || ""),
          meal_time: String(pick("meal_time") || pick("mealTime") || ""),
          serving_size: String(
            pick("serving_size") || pick("servingSize") || ""
          ),
          calories: String(pick("calories") || ""),
          protein: String(pick("protein") || ""),
          carbohydrates: String(pick("carbohydrates") || ""),
          fats: String(pick("fats") || ""),
          image: String(pick("image") || ""),
        };

        return {
          ...meal,
          meals: [
            {
              optionType: "option_1",
              dishes: [reconstructed],
            },
          ],
        };
      }

      return meal;
    };

    return meals.map(normalizeOne);
  }

  static parseNumber(value) {
    if (value == null) return null;
    const raw = String(value);
    const match = raw.match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const n = Number.parseFloat(match[0]);
    return Number.isFinite(n) ? n : null;
  }

  static formatRangeDate(date) {
    const d = date.getDate();
    const suffix =
      d % 10 === 1 && d % 100 !== 11
        ? "st"
        : d % 10 === 2 && d % 100 !== 12
          ? "nd"
          : d % 10 === 3 && d % 100 !== 13
            ? "rd"
            : "th";
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${d}${suffix} ${month}, ${date.getFullYear()}`;
  }

  static addDays(date, days) {
    const copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  static scheduleLabelFromMealType(mealTypeRaw) {

    const raw = (mealTypeRaw || "").trim();
    if (!raw) return "Meal";
    const k = raw.toLowerCase().replace(/\s+/g, "_");

    const map = {
      when_you_wake_up: "When You Wake Up",
      wake_up: "When You Wake Up",
      wakeup: "When You Wake Up",
      pre_wakeup: "When You Wake Up",

      before_breakfast: "Before Breakfast",
      pre_breakfast: "Before Breakfast",

      breakfast: "Breakfast",

      mid_day_meal: "Mid-day Meal",
      midday_meal: "Mid-day Meal",
      lunch: "Lunch",

      post_lunch_snack: "Post Lunch Snack",
      post_lunch: "Post Lunch Snack",
      postlunch: "Post Lunch Snack",

      evening_snack: "Evening Snack",
      snack: "Evening Snack",

      dinner: "Dinner",
      night: "Dinner",

      after_dinner: "After Dinner",
      before_sleep: "Before Sleep",
      pre_sleep: "Before Sleep",
    };

    return (
      map[k] || raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  static normalizeTimeDisplay(raw) {
    const t = PdfService.normalizeTime(raw);
    const m = t.match(/^(\d{2}):(\d{2})$/);
    if (!m) return t;
    const hh = Number.parseInt(m[1] || "0", 10);
    const mm = m[2] || "00";
    return `${hh}:${mm}`;
  }

  static timeToMinutes(raw) {
    const t = PdfService.normalizeTime(raw);
    const m = t.match(/^(\d{2}):(\d{2})$/);
    if (!m) return null;
    const hh = Number.parseInt(m[1] || "0", 10);
    const mm = Number.parseInt(m[2] || "0", 10);
    return hh * 60 + mm;
  }

  static normalizeTime(raw) {
    if (!raw) return "";
    const t = raw.trim();
    const m = t.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return t;
    const hhRaw = m[1] ?? "";
    const mmRaw = m[2] ?? "";
    if (!hhRaw || !mmRaw) return t;
    const hh = hhRaw.padStart(2, "0");
    return `${hh}:${mmRaw}`;
  }

  static escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }


  static buildScheduleMealsHtml(meals) {

    const normalizedMeals =
      PdfService.normalizePlanTableMealsForRendering(meals);
    if (!normalizedMeals || normalizedMeals.length === 0) {
      return `<div class="schedule-empty">No plan available yet</div>`;
    }


    const dishCard = (dish, isGrid = false, isLast = false, isRight = false) => {
      const name = PdfService.escapeHtml(dish.dish_name || "");
      const description = dish.description ? PdfService.escapeHtml(dish.description) : "";

      const serving = dish.serving_size ? PdfService.escapeHtml(String(dish.serving_size)) : "";
      const calories = dish.calories ? `${PdfService.escapeHtml(String(dish.calories))} kcal` : "";
      const protein = dish.protein ? `${PdfService.escapeHtml(String(dish.protein))} g` : "";
      const carbs = dish.carbohydrates ? `${PdfService.escapeHtml(String(dish.carbohydrates))} g` : "";
      const fats = dish.fats ? `${PdfService.escapeHtml(String(dish.fats))} g` : "";

      const metaList = [
        serving ? `<li><strong>Serving:</strong> ${serving}</li>` : "",
        calories ? `<li><strong>Calories:</strong> ${calories}</li>` : "",
        protein ? `<li><strong>Protein:</strong> ${protein}</li>` : "",
        carbs ? `<li><strong>Carbs:</strong> ${carbs}</li>` : "",
        fats ? `<li><strong>Fats:</strong> ${fats}</li>` : "",
      ].filter(Boolean).join("");

      const imgWidth = '100px';
      const imgHeight = '75px';
      const borderRadius = '8px';
      const metaPadding = isGrid ? '8px' : '12px';
      const metaFontSize = isGrid ? '14px' : '16px';

      const img = dish.image
        ? `<div style="width: ${imgWidth}; height: ${imgHeight}; background-color: #e5e7eb; border-radius: ${borderRadius}; overflow: hidden; flex-shrink: 0;">
             <img src="${PdfService.escapeHtml(String(dish.image))}" alt="${name}" style="width: ${imgWidth}; height: ${imgHeight}; max-width: ${imgWidth}; max-height: ${imgHeight}; object-fit: cover; image-rendering: -webkit-optimize-contrast;" onerror="this.onerror=null; this.src='${PdfService.PLACEHOLDER_IMAGE}';" />
           </div>`
        : `<div style="width: ${imgWidth}; height: ${imgHeight}; background-color: #e5e7eb; border-radius: ${borderRadius}; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">NO IMAGE</div>`;

      if (!isGrid) {

        return `
        <div style="page-break-inside: avoid;">
          <div style="margin-bottom: 15px;">
             <h3 style="font-size: 21px; font-weight: bold; color: black; margin: 0 0 5px 0;">${name}</h3>
             ${description ? `<p style="font-size: 17px; color: #666; margin: 0;">${description}</p>` : ""}
          </div>
          <div style="display: flex; gap: 20px;align-items: center;">
             ${img}
             <div style="flex: 1; background-color: #eef7ee; border: 1px solid #c8e6c9; border-radius: 10px; padding: 15px; display: flex; flex-direction: column; justify-content: center;">
               <ul style="list-style: none; margin: 0; padding: 0; font-size: 15px; color: black; line-height: 1.5;">
                 ${metaList || "<li>No details</li>"}
               </ul>
             </div>
          </div>
        </div>
        `;
      } else {
        return `
        <div style="page-break-inside: avoid;">
             <h3 style="font-size: 21px; font-weight: bold; color: black; margin: 0 0 5px 0;">${name}</h3>
             ${description ? `<p style="font-size: 16px; color: #666; margin: 0 0 10px 0;">${description}</p>` : ""}
             
             <div style="display: flex; gap: 10px; align-items: center;">
                ${img}
                <div style="flex: 1; background-color: #eef7ee; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: center;">
                  <ul style="list-style: none; margin: 0; padding: 0; font-size: 15px; color: black; line-height: 1.5;">
                    ${metaList || "<li>No details</li>"}
                  </ul>
                </div>
             </div>
        </div>
        `;
      }
    };


    const renderSlot = (meal, mealType) => {
      const options = (meal.meals || []).filter(Boolean);

      const allDishes = options.flatMap((opt) => opt.dishes || []);

      const timeCandidate =
        allDishes.find((d) => d.meal_time)?.meal_time || "";
      const time = PdfService.normalizeTimeDisplay(String(timeCandidate || ""));

      let label = PdfService.scheduleLabelFromMealType(meal.mealType).toUpperCase();
      const rawType = (meal.mealType || "").toLowerCase().replace(/\s+/g, "_");

      if (
        (rawType === "mid_day_meal" || rawType === "midday_meal" || rawType === "lunch") &&
        (time.includes("1:15") || time.includes("13:15") || time.includes("01:15"))
      ) {
        label = "LUNCH";
      }


      const isLunch = label === "LUNCH" || rawType.includes("lunch");
      const isDinner = label === "DINNER" || rawType.includes("dinner");

      let contentHtml = "";


      const isSingleColumn = ["wake_up", "when_you_wake_up", "wakeup", "pre_wakeup", "pre_breakfast", "early_morning", "before_breakfast"].some(t => rawType.includes(t));

      if (isLunch || isDinner) {

        const renderGroupHelper = (title, dishes) => {
          if (!dishes || dishes.length === 0) return "";

          let displayTitle = title;

          const headerHtml = displayTitle
            ? `<div style="background: linear-gradient(to right, #5cb85c, #aed581); color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 8px; margin-bottom: 15px; font-size: 18px; page-break-after: avoid; break-after: avoid;">
                   ${displayTitle}
                 </div>`
            : "";

          return `
                <div style="margin-bottom: 20px;">
                  ${headerHtml}
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    ${dishes.map((d, idx) => {
            const extraStyle = idx % 2 !== 0 ? "border-left: 1px solid #ddd; padding-left: 20px;" : "";
            return `<div style="display: flex; flex-direction: column; ${extraStyle}">
                                  ${dishCard(d, true).replace(/<div style="">/, '<div style="flex: 1;">')} 
                               </div>`;
          }).join("")}
                  </div>
                </div>
              `;
        };

        const groupedDishes = {
          "Salad Options (Choose Any 1 Option)": [],
          "Accompaniments Options (Choose Any 1 Option)": [],
          "Roti/Rice & Sides Options (Choose Any 1 Option)": [],
          "Vegetable/Dal & Curries Options (Choose Any 1 Option)": [],
          "Other": []
        };

        const saladKeywords = ["salad", "kachumber", "greens", "kosambari", "slaw", "lettuce"];
        const accompanimentsKeywords = ["raita", "curd", "yogurt", "chutney", "pickle", "dahi", "buttermilk", "chaas", "dip", "sauce", "hummus", "salsa", "guacamole", "soup", "shorba"];
        const rotiKeywords = ["roti", "rice", "bhaat", "khichdi", "pulao", "biryani", "chapati", "phulka", "bhakri", "thepla", "paratha", "naan", "kulcha", "rotla", "bread", "toast", "sandwich", "wrap", "frankie", "taco", "quesadilla", "dosa", "idli", "uttapam", "quinoa", "oats", "poha", "upma"];
        const sabziKeywords = ["sabzi", "bharta", "subzi", "curry", "saag", "korma", "dal", "daal", "amti", "kadhi", "gravy", "paneer", "kofta", "bhaji", "bhindi", "tofu", "stir-fry", "masala", "vegetable", "veg", "aloo", "gobi", "gobhi", "corn", "mushroom", "soya", "rajma", "chana", "chole", "lobia", "matar", "mutter", "palak", "methi", "baingan", "capsicum", "egg", "chicken", "fish", "mutton", "meat", "cheela", "chilla", "besan", "spinach", "fenugreek", "gawar", "cluster bean", "lentil", "legume", "bean", "cabbage"];

        for (const dish of allDishes) {
          const name = (dish.dish_name || "").toLowerCase();
          const desc = (dish.description || "").toLowerCase();
          const text = name + " " + desc;

          const hasKeyword = (keywords) => keywords.some(k => text.includes(k));

          if (hasKeyword(rotiKeywords)) {
            groupedDishes["Roti/Rice & Sides Options (Choose Any 1 Option)"].push(dish);
          } else if (hasKeyword(saladKeywords)) {
            groupedDishes["Salad Options (Choose Any 1 Option)"].push(dish);
          } else if (hasKeyword(accompanimentsKeywords)) {
            groupedDishes["Accompaniments Options (Choose Any 1 Option)"].push(dish);
          } else if (hasKeyword(sabziKeywords)) {
            groupedDishes["Vegetable/Dal & Curries Options (Choose Any 1 Option)"].push(dish);
          } else {
            groupedDishes["Other"].push(dish);
          }
        }

        contentHtml += renderGroupHelper("Salad Options (Choose Any 1 Option)", groupedDishes["Salad Options (Choose Any 1 Option)"]);
        contentHtml += renderGroupHelper("Accompaniments Options (Choose Any 1 Option)", groupedDishes["Accompaniments Options (Choose Any 1 Option)"]);
        contentHtml += renderGroupHelper("Roti/Rice & Sides Options (Choose Any 1 Option)", groupedDishes["Roti/Rice & Sides Options (Choose Any 1 Option)"]);
        contentHtml += renderGroupHelper("Vegetable/Dal & Curries Options (Choose Any 1 Option)", groupedDishes["Vegetable/Dal & Curries Options (Choose Any 1 Option)"]);


        const others = groupedDishes["Other"];
        if (others.length > 0) {
          const title = others.length > 1 ? "Choose Any 1 Option" : "Option";
          contentHtml += renderGroupHelper(title, others);
        }

      } else if (!isSingleColumn) {


        const renderGroupHelper = (title, dishes) => {
          if (!dishes || dishes.length === 0) return "";
          const headerHtml = title
            ? `<div style="background: linear-gradient(to right, #5cb85c, #aed581); color: white; text-align: center; font-weight: bold; padding: 8px; border-radius: 8px; margin-bottom: 15px; font-size: 18px; page-break-after: avoid; break-after: avoid;">
                 ${title}
               </div>`
            : "";
          return `
              <div style="margin-bottom: 20px;">
                ${headerHtml}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  ${dishes.map((d, idx) => {
            const extraStyle = idx % 2 !== 0 ? "border-left: 1px solid #ddd; padding-left: 20px;" : "";
            return `<div style="display: flex; flex-direction: column; ${extraStyle}">
                                ${dishCard(d, true).replace(/<div style="">/, '<div style="flex: 1;">')} 
                             </div>`;
          }).join("")}
                </div>
              </div>
            `;
        };

        if (options.length > 1) {
          const title = "Choose Any 1 Option";
          contentHtml = renderGroupHelper(title, allDishes);
        } else {
          contentHtml = renderGroupHelper(null, allDishes);
        }
      } else {

        contentHtml = allDishes.map(d => dishCard(d, false)).join('<div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;"></div>');
      }

      return `
      <div style="background-color: #fbf9f1; border: 1px solid #e0e0e0; border-radius: 15px; padding: 20px; shadow-sm; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 30px; -webkit-box-decoration-break: clone; box-decoration-break: clone;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-left: 4px solid #4CAF50; padding-left: 10px; page-break-after: avoid; break-after: avoid;">
          <h2 style="font-size: 24px; font-weight: bold; color: #4CAF50; text-transform: uppercase; margin: 0;">${label}</h2>
          <div style="background-color: #4CAF50; color: white; padding: 5px 10px; border-radius: 5px; display: flex; align-items: center; font-size: 17px; font-weight: bold;">
            <span style="margin-right: 5px; display: flex; align-items: center;">${PdfService.CLOCK_ICON_SVG}</span> ${time}
          </div>
        </div>
        ${contentHtml}
      </div>
      `;
    };


    const slots = [];
    let i = 0;
    while (i < normalizedMeals.length) {
      const meal = normalizedMeals[i];
      const nextMeal = normalizedMeals[i + 1];

      const rawType1 = (meal.mealType || "").toLowerCase().replace(/\s+/g, "_");
      const isWakeUp = [
        "when_you_wake_up",
        "wake_up",
        "wakeup",
        "pre_wakeup",
      ].some(t => rawType1.includes(t));

      let isPreBreakfast = false;
      if (nextMeal) {
        const rawType2 = (nextMeal.mealType || "").toLowerCase().replace(/\s+/g, "_");
        isPreBreakfast = ["before_breakfast", "pre_breakfast", "early_morning"].some(t => rawType2.includes(t));
      }


      const addPageBreakAvoid = (html) => {
        return html.replace('shadow-sm;', 'shadow-sm; page-break-inside: avoid;');
      };

      if (isWakeUp && isPreBreakfast && nextMeal) {
        const slot1 = renderSlot(meal, meal.mealType);
        const slot2 = renderSlot(nextMeal, nextMeal.mealType);

        const wrapAsFlex = (html) => html.replace('margin-bottom: 30px;', 'margin-bottom: 0px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; flex: 1;');

        slots.push(`
          <div style="display: flex; gap: 20px; page-break-inside: avoid; margin-bottom: 30px; margin-top: 30px;">
             <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">${wrapAsFlex(slot1)}</div>
             <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">${wrapAsFlex(slot2)}</div>
          </div>
        `);
        i += 2;
      } else {
        let slot = renderSlot(meal, meal.mealType);

        if (isWakeUp || ["before_breakfast", "pre_breakfast", "early_morning"].some(t => rawType1.includes(t))) {
          slot = slot.replace('margin-bottom: 30px;', 'margin-bottom: 30px; margin-top: 30px;');
        }



        const isAfterDinner = ["after_dinner", "post_dinner"].some(t => rawType1.includes(t));

        const isLargeSection = [
          "lunch",
          "dinner",
          "mid_day_meal",
          "midday_meal"
        ].some(t => rawType1.includes(t));

        if (isLargeSection) {
          slots.push(slot);
        } else {
          slots.push(addPageBreakAvoid(slot));
        }
        i++;
      }
    }

    return slots.join("");
  }

  static statusFromRange(
    value,
    low,
    high
  ) {
    if (value == null) return "—";
    if (value < low) return "LOW";
    if (value > high) return "HIGH";
    return "NORMAL";
  }

  static pillClass(status) {
    return status === "NORMAL"
      ? "pill pill-green"
      : status === "LOW"
        ? "pill pill-red"
        : status === "HIGH"
          ? "pill pill-red"
          : "pill";
  }

  static findFromHealthMatrix(
    healthMatrix,
    keys
  ) {
    if (!Array.isArray(healthMatrix)) return null;
    const normKeys = keys.map((k) => k.toLowerCase());
    for (const entry of healthMatrix) {
      if (!entry || typeof entry !== "object") continue;
      const obj = entry;
      const label =
        typeof obj.label === "string"
          ? obj.label
          : typeof obj.name === "string"
            ? obj.name
            : typeof obj.title === "string"
              ? obj.title
              : "";
      const normLabel = label.toLowerCase();
      if (!normLabel) continue;
      if (!normKeys.some((k) => normLabel.includes(k))) continue;

      const value =
        typeof obj.value === "string" || typeof obj.value === "number"
          ? String(obj.value)
          : typeof obj.val === "string" || typeof obj.val === "number"
            ? String(obj.val)
            : typeof obj.result === "string" || typeof obj.result === "number"
              ? String(obj.result)
              : undefined;
      const unit =
        typeof obj.unit === "string"
          ? obj.unit
          : typeof obj.uom === "string"
            ? obj.uom
            : undefined;
      if (!value) continue;
      if (unit) return { value, unit };
      return { value };
    }
    return null;
  }

  static async generateMealPlanPdfBuffer(payload) {
    await PdfService.initImages();
    const daySections = await PdfService.buildDaySections(payload);
    const pdfBuffer = await PdfService.buildPdfBuffer(payload, daySections);

    try {
      const compressedBuffer = await compress(pdfBuffer, {
        resolution: "ebook",
        compatibilityLevel: "1.4",
        pdfPassword: ""
      });
      return compressedBuffer;
    } catch (error) {
      console.error("PDF compression failed, returning original buffer:", error?.message || error);
      return pdfBuffer;
    }
  }

  static buildPlanTablePayload(payload) {
    const plans = []
    for (const key of Object.keys(payload)) {
      plans.push(payload[key])
    }
    return plans
  }

  static async buildDaySections(payload) {
    const planDefinition = payload.plan || {};
    const planKeys = Object.keys(planDefinition || {});
    const mapKeys = payload.plansMap ? Object.keys(payload.plansMap) : [];
    const dayKeys = planKeys.length ? planKeys : mapKeys;

    const planIds = Object.values(payload.plansMap || {})
      .map((planId) => planId?.toString())
      .filter(Boolean);

    let planTables = [];
    try {
      if (planIds.length) {
        planTables = this.buildPlanTablePayload(payload)
      }
    } catch (e) { }

    const planTableById = {};
    for (const planTable of planTables) {
      if (planTable._id) {
        planTableById[planTable._id.toString()] = planTable;
      }
    }

    const convertPayloadToMeals = (dayPlan) => {
      if (!dayPlan || typeof dayPlan !== "object") return [];
      const ignoredKeys = new Set(["totals", "_id", "day", "date"]);
      const mealTypeKeys = Object.keys(dayPlan)
        .filter((k) => !ignoredKeys.has(k))
        .sort((a, b) => {
          const idxA = PdfService.MEAL_PRIORITY_ORDER.indexOf(a);
          const idxB = PdfService.MEAL_PRIORITY_ORDER.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
        });

      return mealTypeKeys.map(mealType => {
        const content = dayPlan[mealType];
        const options = [];

        if (Array.isArray(content)) {
          options.push({
            optionType: "Option 1",
            dishes: content
          });
        } else if (content && typeof content === "object") {
          const subKeys = Object.keys(content);
          const isDish = (obj) => typeof obj.dish_name === "string" || typeof obj.dishName === "string";

          if (isDish(content)) {
            options.push({
              optionType: "Option 1",
              dishes: [content]
            });
          } else {
            for (const subKey of subKeys) {
              const subContent = content[subKey];
              if (!subContent) continue;

              if (subKey === "base") {
                const dishes = Array.isArray(subContent) ? subContent : [subContent];
                options.push({
                  optionType: "Base",
                  dishes: dishes
                });
              } else if (subKey.includes("choose_any") || subKey.includes("options")) {
                if (Array.isArray(subContent)) {
                  subContent.forEach((item, idx) => {
                    let dishes = Array.isArray(item) ? item : (item.dishes || [item]);
                    options.push({ optionType: `${subKey} Option ${idx + 1}`, dishes });
                  });
                }
              } else {
                const dishes = Array.isArray(subContent) ? subContent : [subContent];
                options.push({ optionType: subKey, dishes });
              }
            }
          }
        }
        return { mealType, meals: options };
      });
    };

    const results = [];
    const sortedDayKeys = dayKeys.sort((a, b) => {
      const da = parseInt(a.replace(/\D/g, '')) || 0;
      const db = parseInt(b.replace(/\D/g, '')) || 0;
      return da - db;
    });

    for (const key of sortedDayKeys) {
      let meals = [];
      let totals = {};

      if (payload.plan && payload.plan[key]) {
        const dayObj = payload.plan[key];
        totals = dayObj.totals || {};
        meals = convertPayloadToMeals(dayObj);
      }
      else if (payload.plansMap && payload.plansMap[key]) {
        const pid = payload.plansMap[key].toString();
        const found = planTableById[pid];
        if (found) {
          meals = found.meals;
        }
      }

      const mealsHtml = PdfService.buildScheduleMealsHtml(meals);

      let label = key;
      if (key.toLowerCase().startsWith('day')) {
        if (payload.cover && payload.cover.dateTime) {
          const start = new Date(payload.cover.dateTime);
          const offset = (parseInt(key.replace(/\D/g, '')) || 1) - 1;
          const current = PdfService.addDays(start, offset);
          label = `${key} (${PdfService.formatRangeDate(current)})`;
        }
      }

      results.push({ dayLabel: "", totals, mealsHtml, meals });
    }

    return results;
  }

  static async buildPdfBuffer(payload, daySections) {
    const htmlContent = PdfService.generateFullHtml(payload, daySections);
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--force-device-scale-factor=0.75'
      ],
      headless: true
    });

    try {
      const page = await browser.newPage();

      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 0.75
      });
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();
        if (resourceType === 'font') {
          request.abort();
        } else if (['document', 'stylesheet', 'image'].includes(resourceType)) {
          request.continue();
        } else {
          request.abort();
        }
      });

      await page.setContent(htmlContent, { waitUntil: 'networkidle2', timeout: 60000 });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        preferCSSPageSize: false,
        scale: 0.85, // Optimized scale - smaller file, readable content
        // Optimize for smaller file size
        tagged: false, // Don't generate tagged PDF (reduces size)
        headerTemplate: `
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 3px solid #4CAF50; margin-bottom: 15px; margin-left: 20px; margin-right: 20px; background-color: white; -webkit-print-color-adjust: exact; padding-top: 10px;">
            <div style="max-width: 70%;">
              <div style="margin-bottom: 5px; display: flex; align-items: center; font-size: 50px; font-weight: bold; color: #009640;">
                <img src="${PdfService.LOGO_BASE64}" alt="METROPOLIS" style="height: 50px;" />
              </div>
              <div style="font-size: 10px; color: #555; line-height: 1.3; font-family: Helvetica, Arial, sans-serif;">
                HQ Address: Metropolis Healthcare Limited 4th Floor, East Wing, Plot-254 B, Nirlon House,<br />
                Dr. Annie Besant Road, Worli, Mumbai - 400030, Maharashtra, India.
              </div>
            </div>
            <div style="width: 70px; height: 70px; background-color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 1px solid #eee;">
              <img src="${PdfService.QR_CODE_BASE64}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;" />
            </div>
          </div>
        `,
        footerTemplate: `
          <div style="width: 100%; font-size: 14px; text-align: center; -webkit-print-color-adjust: exact; background-color: transparent;">
             <div style="border-top: 2px solid #4CAF50; margin-left: 20px; margin-right: 20px; padding-top: 15px; padding-bottom: 10px;">
                <span style="font-weight: bold; color: #374151; font-family: Helvetica, Arial, sans-serif;">Page <span class="pageNumber"></span></span>
             </div>
          </div>
        `,
        margin: { top: '150px', bottom: '80px', left: '0px', right: '0px' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  static buildCoverHtml(
    cover,
    payload,
    daySections,
    clientPreferences,
  ) {

    const primaryTotals = daySections[0]?.totals || {};
    const foodsToEat = payload.foodsToEat || [];
    const foodsToAvoid = payload.foodsToAvoid || [];
    const prefs = clientPreferences?.preferences || {};
    const region =
      typeof prefs.regionPreference === "string"
        ? prefs.regionPreference
        : "";
    const dietPref =
      typeof prefs.dietPreference === "string" ? prefs.dietPreference : "";
    const activity =
      typeof prefs.activityLevel === "string" ? prefs.activityLevel : "";
    const goal =
      typeof prefs.fitnessGoal === "string" ? prefs.fitnessGoal : "";
    const water =
      typeof prefs.waterIntake === "string" ? prefs.waterIntake : "";

    const calories = primaryTotals.calories ?? null;
    const protein = primaryTotals.protein ?? null;
    const carbs = primaryTotals.carbohydrates ?? null;
    const fats = primaryTotals.fats ?? null;

    const kcalTarget =
      calories != null ? `${Math.round(calories * 10) / 10} kcal` : "—";
    const proteinTarget =
      protein != null ? `${Math.round(protein)} gms/day` : "—";
    const carbsTarget = carbs != null ? `${Math.round(carbs)} gms/day` : "—";
    const fatsTarget = fats != null ? `${Math.round(fats)} gms/day` : "—";
    const fiberTarget = "35 gms/day";

    const exerciseTarget =
      /activity/i.test(activity) && /super/i.test(activity)
        ? "45 minutes"
        : /moderate/i.test(activity)
          ? "30 minutes"
          : "30 minutes";

    const waterTarget =
      water && !/not specified/i.test(water)
        ? PdfService.escapeHtml(water)
        : "2-3 Litres";

    const fmtFood = (s) => {
      const idx = s.indexOf(":");
      if (idx > 0 && idx < 40) {
        const a = PdfService.escapeHtml(s.slice(0, idx));
        const b = PdfService.escapeHtml(s.slice(idx + 1).trim());
        return `<strong>${a}:</strong> ${b}`;
      }
      return PdfService.escapeHtml(s);
    };

    const eatList = foodsToEat.length
      ? foodsToEat.slice(0, 22).map((x) => `<li style="display: flex; align-items: flex-start; font-size: 14px; color: black; font-weight: 600; margin-bottom: 4px;">
                <span style="margin-right: 8px; font-size: 14px; line-height: 1;">•</span>
                <span>${fmtFood(String(x))}</span>
              </li>`).join("")
      : `<li style="list-style: none;">—</li>`;

    const avoidList = foodsToAvoid.length
      ? foodsToAvoid.slice(0, 22).map((x) => `<li style="display: flex; align-items: flex-start; font-size: 14px; color: black; font-weight: 600; margin-bottom: 4px;">
                <span style="margin-right: 8px; font-size: 14px; line-height: 1;">•</span>
                <span>${fmtFood(String(x))}</span>
              </li>`).join("")
      : `<li style="list-style: none;">—</li>`;

    return `
    <div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 15px; box-sizing: border-box; color: #000; font-family: 'Roboto', sans-serif; position: relative;">

      <h2 style="font-size: 25px; font-weight: bold; margin-bottom: 10px; color: black;">Patient Summary</h2>

      <!-- Patient Summary -->
      <div style="border: 2px solid #4CAF50; border-radius: 10px; padding: 12px; display: flex; flex-wrap: wrap; background-color: #fbf9f1; margin-bottom: 20px;">
        <!-- Row 1 -->
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Patient Name</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(cover.name || "")}</span>
          </div>
        </div>
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Gender</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(cover.gender || "")}</span>
          </div>
        </div>
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Age</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(String(cover.age || ""))}</span>
          </div>
        </div>
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Mobile No.</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(cover.contactNumber || "")}</span>
          </div>
        </div>

        <!-- Row 2 -->
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-right: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="color: #009640; font-weight: bold; font-size: 16px; margin-right: 8px;">PID</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Patient Identification</span>
            <span style="font-family: monospace; font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(cover.pid || "")}</span>
          </div>
        </div>
        <div style="width: 25%; box-sizing: border-box; padding: 8px; border-right: 1px solid #e0e0e0; display: flex; align-items: center;">
          <div style="color: #009640; font-weight: bold; font-size: 16px; margin-right: 8px;">VID</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Virtual Identification</span>
            <span style="font-family: monospace; font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml("")}</span>
          </div>
        </div>
        <div style="width: 50%; box-sizing: border-box; padding: 8px; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Email ID</span>
            <span style="font-size: 21px; font-weight: bold; color: black; word-break: break-all;">${PdfService.escapeHtml(cover.email || "")}</span>
          </div>
        </div>
      </div>

      <h2 style="font-size: 25px; font-weight: bold; margin-bottom: 10px; color: black;">Diet Plan Details</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="border: 2px solid #CDDC39; border-radius: 12px; padding: 10px; display: flex; align-items: center; background-color: #fbf9f1;">
          <div style="width: 24px; height: 24px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Regional Diet Preference</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(region || "—")}</span>
          </div>
        </div>
        <div style="border: 2px solid #CDDC39; border-radius: 12px; padding: 10px; display: flex; align-items: center; background-color: #fbf9f1;">
          <div style="width: 24px; height: 24px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            ${(/vegan/i.test(dietPref) || (/vegetarian/i.test(dietPref) && !/non/i.test(dietPref)))
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="white" stroke="#009640" /><circle cx="12" cy="12" r="4" fill="#009640" stroke="none" /></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="white" stroke="red" /><circle cx="12" cy="12" r="4" fill="red" stroke="none" /></svg>`
      }
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Food Choice</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(dietPref || "—")}</span>
          </div>
        </div>
        <div style="border: 2px solid #CDDC39; border-radius: 12px; padding: 10px; display: flex; align-items: center; background-color: #fbf9f1;">
          <div style="width: 24px; height: 24px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Lifestyle</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(activity || "—")}</span>
          </div>
        </div>
        <div style="border: 2px solid #CDDC39; border-radius: 12px; padding: 10px; display: flex; align-items: center; background-color: #fbf9f1;">
          <div style="width: 24px; height: 24px; margin-right: 8px; color: #4CAF50; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 18px; color: #888; margin-bottom: 1px;">Diet Plan Type</span>
            <span style="font-size: 21px; font-weight: bold; color: black;">${PdfService.escapeHtml(goal || "—")}</span>
          </div>
        </div>
      </div>

      <h2 style="font-size: 25px; font-weight: bold; margin-bottom: 10px; color: black;">Suggested for You</h2>
      <div style="display: flex; gap: 20px; background-color: #fbf9f1; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div style="padding: 10px; display: flex; align-items: center;">
            <div style="width: 28px; height: 28px; margin-right: 12px; color: #4CAF50; border: 2px solid #CDDC39; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px;">🔥</div>
            <div style="display: flex; flex-direction: column;">
              <div style="font-size: 19px; color: #666; font-weight: 600;">Daily Micronutrient Intake Target</div>
              <div style="font-size: 33px; color: #00b050; font-weight: 800;">${PdfService.escapeHtml(kcalTarget)}</div>
            </div>
          </div>
          <div style="padding: 10px; display: flex; align-items: center;">
            <div style="width: 28px; height: 28px; margin-right: 12px; color: #4CAF50; border: 2px solid #CDDC39; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px;">⏱️</div>
            <div style="display: flex; flex-direction: column;">
              <div style="font-size: 19px; color: #666; font-weight: 600;">Daily Exercise Duration</div>
              <div style="font-size: 33px; color: #00b050; font-weight: 800;">${PdfService.escapeHtml(exerciseTarget)}</div>
            </div>
          </div>
          <div style="padding: 10px; display: flex; align-items: center;">
            <div style="width: 28px; height: 28px; margin-right: 12px; color: #4CAF50; border: 2px solid #CDDC39; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px;">💧</div>
            <div style="display: flex; flex-direction: column;">
              <div style="font-size: 19px; color: #666; font-weight: 600;">Daily Water Intake Target</div>
              <div style="font-size: 33px; color: #00b050; font-weight: 800;">${waterTarget}</div>
            </div>
          </div>
        </div>

        <div style="flex: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background-color: #00b050; color: white; border-radius: 12px; padding: 15px; display: flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-right: 10px; background-color: rgba(255,255,255,0.2); border-radius: 10px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🥛</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 19px; opacity: 0.9;">Protein Intake</span>
              <span style="font-size: 33px; font-weight: bold;">${PdfService.escapeHtml(proteinTarget)}</span>
            </div>
          </div>
          <div style="background-color: #00b050; color: white; border-radius: 12px; padding: 15px; display: flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-right: 10px; background-color: rgba(255,255,255,0.2); border-radius: 10px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🥑</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 19px; opacity: 0.9;">Carbohydrate Intake</span>
              <span style="font-size: 33px; font-weight: bold;">${PdfService.escapeHtml(carbsTarget)}</span>
            </div>
          </div>
          <div style="background-color: #00b050; color: white; border-radius: 12px; padding: 15px; display: flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-right: 10px; background-color: rgba(255,255,255,0.2); border-radius: 10px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🍕</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 19px; opacity: 0.9;">Fat Intake</span>
              <span style="font-size: 33px; font-weight: bold;">${PdfService.escapeHtml(fatsTarget)}</span>
            </div>
          </div>
          <div style="background-color: #00b050; color: white; border-radius: 12px; padding: 15px; display: flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-right: 10px; background-color: rgba(255,255,255,0.2); border-radius: 10px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🌾</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 19px; opacity: 0.9;">Fiber Intake</span>
              <span style="font-size: 33px; font-weight: bold;">${PdfService.escapeHtml(fiberTarget)}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 style="font-size: 25px; font-weight: bold; margin-bottom: 10px; color: black;">Dietary Recommendations</h2>
      <div style="display: flex; gap: 15px; margin-bottom: 10px; page-break-before: avoid; page-break-inside: auto;">
        <!-- Recommended Foods -->
        <div style="flex: 1; border: 2px solid #4CAF50; border-radius: 12px; background-color: #eef7ee; -webkit-box-decoration-break: clone; box-decoration-break: clone; min-height: auto; max-height: 565px; overflow: hidden; position: relative;">
          <div style="background-color: #eef7ee; padding: 8px 12px; display: flex; align-items: center; border-radius: 10px 10px 0 0;">
            <div style="width: 20px; height: 20px; margin-right: 8px; background-color: #4CAF50; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span style="font-size: 21px; font-weight: bold; color: #2e7d32;">Recommended Foods</span>
          </div>
          <div style="padding: 12px;">
            <ul style="list-style: none; margin: 0; padding: 0; font-size: 18px;">
              ${eatList}
            </ul>
          </div>
        </div>

        <!-- Foods to Avoid -->
        <div style="flex: 1; border: 2px solid #ff5252; border-radius: 12px; background-color: #ffebee; -webkit-box-decoration-break: clone; box-decoration-break: clone; min-height: auto; max-height: 565px; overflow: hidden; position: relative;">
          <div style="background-color: #ffebee; padding: 8px 12px; display: flex; align-items: center; border-radius: 10px 10px 0 0;">
            <div style="width: 20px; height: 20px; margin-right: 8px; background-color: #ff5252; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </div>
            <span style="font-size: 21px; font-weight: bold; color: #c62828;">Foods to Avoid</span>
          </div>
          <div style="padding: 12px;">
            <ul style="list-style: none; margin: 0; padding: 0; font-size: 18px;">
              ${avoidList}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
  }

  static getStoryMarkup(text) {
    return `
      <div style="margin-bottom: 25px; page-break-before: always;">
        <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 10px; color: #000; border-bottom: 3px solid #4CAF50; display: inline-block; padding-bottom: 2px;">Patient History</h2>
        <p style="font-size: 16px; line-height: 1.6; color: rgba(0, 0, 0, 0.5); font-weight: 600;">
          ${text}
        </p>
      </div>
      `;
  }

  static getThinkingMarkup(text) {
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 10px; color: #000; border-bottom: 3px solid #4CAF50; display: inline-block; padding-bottom: 2px;">Thinking</h2>
        <p style="font-size: 16px; line-height: 1.6; color: rgba(0, 0, 0, 0.5); font-weight: 600;">
          ${text}
        </p>
      </div>
      `;
  }

  static getNutritionBreakdownMarkup(text, totals = {}) {
    const calories = totals.calories ?? 0;
    const protein = totals.protein ?? 0;
    const carbs = totals.carbohydrates ?? 0;
    const fats = totals.fats ?? 0;

    const pCal = protein * 4;
    const cCal = carbs * 4;
    const fCal = fats * 9;
    const totalCal = (pCal + cCal + fCal) || 1;

    const pPct = Math.round((pCal / totalCal) * 100);
    const cPct = Math.round((cCal / totalCal) * 100);
    const fPct = Math.round((fCal / totalCal) * 100);

    const kcalTarget = calories ? `${Math.round(calories)} kcal` : "—";
    const proteinTarget = protein ? `${Math.round(protein)} g` : "—";
    const carbsTarget = carbs ? `${Math.round(carbs)} g` : "—";
    const fatsTarget = fats ? `${Math.round(fats)} g` : "—";

    return `
      <div style="margin-bottom: 30px; font-family: 'Roboto', sans-serif; color: #000;">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: black; border-bottom: 3px solid #4CAF50; display: inline-block; padding-bottom: 2px;">Nutritional Breakdown</h2>
        
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <!-- Left Card: Targets -->
          <div style="flex: 1; border: 2px solid #4CAF50; border-radius: 15px; padding: 20px; background-color: #fbf9f1;">
            <div style="display: flex; flex-direction: column; gap: 20px;">
              
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #4CAF50; display: flex; align-items: center; justify-content: center; color: #4CAF50; margin-right: 15px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.48 13.03A4 4 0 0 1 16 19h-4a4 4 0 1 1 0-8h1a1 1 0 0 0 0-2h-1a6 6 0 1 0 0 12h4a6 6 0 0 0 5.21-3.23l-1.73-1.74zM12 3a9 9 0 0 0 0 18h4a9 9 0 0 0 0-18h-4zm0 16a7 7 0 1 1 0-14h4a7 7 0 1 1 0 14h-4z" /><path d="M13.2 8.5a1 1 0 0 0-1.4 1.4l1.3 1.3-1.3 1.3a1 1 0 0 0 1.4 1.4l1.3-1.3 1.3 1.3a1 1 0 0 0 1.4-1.4L15.9 11.2l1.3-1.3a1 1 0 1 0-1.4-1.4l-1.3 1.3-1.3-1.3z" /></svg>
                </div>
                <div>
                  <div style="font-size: 12px; font-weight: bold; color: black; margin-bottom: 2px;">Daily Target Calories</div>
                  <div style="font-size: 14px; color: #555;">
                    <span style="font-size: 22px; font-weight: 600; color: #4CAF50;">${kcalTarget}</span>/day <span style="font-size: 14px; color: #555; padding-left: 5px;">to create a moderate deficit for weight loss (TDEE ~2,400 kcal).</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #4CAF50; display: flex; align-items: center; justify-content: center; color: #4CAF50; margin-right: 15px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                </div>
                <div>
                  <div style="font-size: 12px; font-weight: bold; color: black; margin-bottom: 2px;">Protein</div>
                  <div style="font-size: 14px; color: #555;">
                    <span style="font-size: 22px; font-weight: bold; color: #4CAF50;">${proteinTarget}</span>/day <span style="font-size: 14px; color: #555; padding-left: 5px;">to preserve lean mass</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #4CAF50; display: flex; align-items: center; justify-content: center; color: #4CAF50; margin-right: 15px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <div>
                  <div style="font-size: 12px; font-weight: bold; color: black; margin-bottom: 2px;">Carbohydrate</div>
                  <div style="font-size: 14px; color: #555;">
                    <span style="font-size: 22px; font-weight: bold; color: #4CAF50;">${carbsTarget}</span>/day <span style="font-size: 14px; color: #555; padding-left: 5px;">(moderate, low-GI focus)</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #4CAF50; display: flex; align-items: center; justify-content: center; color: #4CAF50; margin-right: 15px; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                </div>
                <div>
                  <div style="font-size: 12px; font-weight: bold; color: black; margin-bottom: 2px;">Fats</div>
                  <div style="font-size: 14px; color: #555;">
                    <span style="font-size: 22px; font-weight: bold; color: #4CAF50;">${fatsTarget}</span>/day <span style="font-size: 14px; color: #555; padding-left: 5px;">(healthy fats)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right Card: Macro Split -->
          <div style="width: 300px; border: 2px solid #4CAF50; border-radius: 15px; padding: 20px; background-color: #fbf9f1; display: flex; flex-direction: column; justify-content: center;">
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: black; margin-top: 0;">Macro split approx.</h3>

            <div style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
              <span style="font-size: 32px; font-weight: bold; color: #4CAF50; margin-right: 10px; width: 80px; display: inline-block;">${pPct}%</span>
              <span style="font-size: 16px; color: #666; font-weight: 500;">Protein</span>
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
              <span style="font-size: 32px; font-weight: bold; color: #4CAF50; margin-right: 10px; width: 80px; display: inline-block;">${cPct}%</span>
              <span style="font-size: 16px; color: #666; font-weight: 500;">Carbohydrate</span>
            </div>

            <div style="display: flex; align-items: center;">
              <span style="font-size: 32px; font-weight: bold; color: #4CAF50; margin-right: 10px; width: 80px; display: inline-block;">${fPct}%</span>
              <span style="font-size: 16px; color: #666; font-weight: 500;">Fats</span>
            </div>
          </div>
        </div>

        <!-- Special Note -->
        <div>
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: black; border-bottom: 3px solid #4CAF50; display: inline-block; padding-bottom: 2px;">Special Note</h2>
          <p style="font-size: 14px; line-height: 1.6; color: black; margin-top: 0;">
            ${text}
          </p>
        </div>
      </div>
      `;
  }

  static generateFullHtml(payload, daySections) {
    const coverInfo = {
      name: payload.cover?.name || payload.title || "AI Personalized Plan",
      vid: payload.cover?.vid || "",
      pid: payload.cover?.metropolisPid || "",
      gender: payload.cover?.gender || "Male",
      age: payload.cover?.age || "30",
      email: payload.cover?.email || "info@metropolisindia.com",
      contactNumber: payload.cover?.contactNumber || "9029034748",
      dateTime:
        payload.cover?.dateTime || PdfService.formatDisplayDate(new Date()),
    };

    const coverHtml = PdfService.buildCoverHtml(
      coverInfo,
      payload,
      daySections,
      payload.clientPreferences
    );

    const storyHTMLMarkup = this.getStoryMarkup(payload.story);
    const thinkingHTMLMarkup = this.getThinkingMarkup(payload.thinking);
    const nutritionBreakdownHTMLMarkup = this.getNutritionBreakdownMarkup(
      payload.nutritionBreakdown,
      daySections[0]?.totals
    );

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Meal Plan</title>
          <style>
            :root {
              --brand - green: #1e974d;
            --brand-light: #f6f6f6;
            --border: #d8d8d8;
            --text-dark: #1b1b1b;
            --bg-alt: #ffffff;
                    }
            img { 
              max-width: 100px;
              max-height: 75px;
              image-rendering: -webkit-optimize-contrast;
            }
            body {
              margin: 0;
            padding: 0;
            font-family: "Helvetica Neue", Arial, sans-serif;
            color: var(--text-dark);
            background: #ffffff;
            font-size: 16px;
                    }
            .page {
              width: 1200px;
            margin: 0 auto;
            background: var(--bg-alt);
            padding: 0px;
            box-sizing: border-box;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            min-height: auto; /* Use min-height to ensure footer at bottom, but safe size */
            position: relative;
                    }
            .reco-inner, .diet4-inner, .schedule-inner {
              flex: 1;
                    }
            .brand-header {
              background: var(--brand-green);
            color: white;
            padding: 0px;
            /* border-radius: 12px; */ /* Removed radius for full bleed look */
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
                    }
            .brand-header h1 {
              margin: 0;
            font-size: 32px;
            letter-spacing: 2px;
                    }
            .brand-details {
              text - align: right;
            font-size: 16px;
                    }
            .section {
              margin - bottom: 30px;
                    }
            .section-title {
              font - size: 26px;
            text-transform: none;
            color: var(--brand-green);
            margin-bottom: 12px;
                    }
            .card-grid {
              display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
                    }
            .card {
              background: var(--brand-light);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #ebebeb;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            gap: 6px;
                    }
            .card strong {
              font - size: 20px;
            display: block;
                    }
            .attribute-tag {
              padding: 4px 12px;
            background: white;
            border-radius: 14px;
            color: var(--brand-green);
            font-size: 15px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
                    }
            .image-placeholder,
            .option-preview,
            .card-placeholder {
              width: 70px;
            height: 70px;
            border-radius: 14px;
            border: 2px dashed var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: var(--border);
            text-transform: uppercase;
            background: white;
            margin-bottom: 6px;
                    }
            .recommendation-grid {
              display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
                    }
            .recommendation-card {
              background: var(--brand-light);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #ebebeb;
                    }
            .recommendation-card ul {
              padding - left: 18px;
            margin: 6px 0 0 0;
            font-size: 16px;
                    }
            .summary-row {
              display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
                    }
            .summary-row span {
              font - weight: bold;
            color: var(--brand-green);
                    }
            .food-list {
              display: flex;
            gap: 12px;
                    }
            .food-list ul {
              list - style: disc;
            padding-left: 20px;
                    }
            .diet-card {
              background: var(--brand-light);
            border-radius: 14px;
            padding: 20px;
            border: 1px solid #ebebeb;
                    }
            .macro-grid {
              display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
                    }
            .macro {
              background: white;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            border: 1px solid #ebebeb;
                    }
            .macro-value {
              font - size: 24px;
            font-weight: bold;
                    }
            .seven-day-section {
              display: flex;
            flex-direction: column;
            gap: 20px;
                    }
            .seven-day-card {
              border: 1px solid #d9d9d9;
            border-radius: 14px;
            padding: 18px;
            background: #ffffff;
                    }
            .card-header {
              display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
                    }
            .card-day {
              font - size: 21px;
            font-weight: bold;
                    }
            .card-stats {
              display: flex;
            gap: 12px;
            font-size: 15px;
            color: #616161;
                    }
            .meal-section {
              margin - bottom: 16px;
                    }
            .meal-section-title {
              font - weight: bold;
            margin-bottom: 8px;
            font-size: 16px;
                    }
            .meal-option {
              display: flex;
            gap: 12px;
            align-items: flex-start;
            margin-bottom: 12px;
                    }
            .option-title {
              text - transform: uppercase;
            font-size: 15px;
            color: #656565;
            margin-bottom: 4px;
                    }
            .meal-option ul {
              margin: 0;
            padding-left: 18px;
            font-size: 15px;
                    }
            .meal-note {
              font - style: italic;
            font-size: 15px;
            color: #8c8c8c;
                    }
            .meal-dish {
              margin - bottom: 8px;
            font-size: 15px;
                    }
            .meal-dish strong {
              font - size: 16px;
            text-transform: uppercase;
            display: block;
                    }
            .meal-dish p {
              margin: 4px 0;
            font-size: 15px;
            color: #3c3c3c;
                    }
            .meal-meta {
              display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 14px;
            color: #4a4a4a;
                    }
            .meal-meta span {
              font - weight: 600;
            font-size: 14px;
            }
            .card-placeholder {
              font - size: 14px;
                    }
            .cover-page {
              padding: 0;
            display: flex;
            flex-direction: column;
            gap: 30px;
            min-height: auto;
            padding-bottom: 20px;
                    }
            .cover-header {
              background: #00a54f;
            color: white;
            padding: 28px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
                    }
            .cover-header h1 {
              margin: 0;
            font-size: 52px;
            letter-spacing: 8px;
                    }
            .cover-header .datetime {
              text - align: right;
            font-size: 20px;
                    }
            .cover-info {
              background: #fbf9f2;
            border-bottom: 3px solid #d9d8d2;
                    }
            .cover-grid {
              padding - inline: 32px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 24px;
            margin-bottom: 18px;
                    }
            .cover-grid label {
              font - size: 17px;
            color: #6c6c6c;
            display: block;
            margin-bottom: 6px;
                    }
            .cover-grid h2 {
              margin: 0;
            font-size: 30px;
            line-height: 26px;
            margin-bottom: 20px;
            font-weight: bold;
                    }
            .cover-grid .cover-details-container {
              border - block: 1px solid black;
                    }
            .cover-grid .cover-details {
              display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #6c6c6c;
            font-size: 16px;
                    }
            .cover-grid .value {
              color: #000000;
                    }
            .cover-contact {
              display: grid;
            padding: 10px 42px;
            border-block: 2px solid #ABABAB;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
                    }
            .cover-contact span {
              font - weight: 600;
            font-size: 20px;
                    }
            .cover-note {
              margin - top: 18px;
            font-size: 17px;
            color: #3d3d3d;
                    }
            .snapshot-wrap {
              background: #ffffff;
            padding: 28px 40px 0 40px;
                    }
            .snapshot-title {
              text - align: center;
            font-size: 26px;
            font-weight: 700;
            color: #0b6b3a;
            text-decoration: underline;
            margin: 0 0 14px 0;
                    }
            .snapshot-subtitle {
              font - size: 20px;
            font-weight: 700;
            color: #0b6b3a;
            margin: 8px 0 12px 0;
                    }
            .snapshot-cards {
              display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
            background: #f1f1f1;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 18px;
                    }
            .snapshot-card {
              background: #eeeeee;
            padding: 16px 16px 14px 16px;
            border-right: 1px solid #e0e0e0;
            position: relative;
            min-height: 160px;
                    }
            .snapshot-card:last-child {
              border - right: 0;
                    }
            .snapshot-card .label {
              font - size: 16px;
            color: #1a1a1a;
            margin-bottom: 10px;
                    }
            .snapshot-card .value-row {
              display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 10px;
                    }
            .snapshot-card .value {
              font - size: 26px;
            font-weight: 800;
            color: #111111;
                    }
            .snapshot-card .unit {
              font - size: 14px;
            color: #333333;
                    }
            .snapshot-card .status-pill {
              display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #0b8d4a;
            color: #0b8d4a;
            border-radius: 999px;
            padding: 6px 18px;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.5px;
            background: #ffffff;
            margin-bottom: 14px;
                    }
            .snapshot-card .ref-label {
              font - size: 14px;
            color: #7d7d7d;
            margin-bottom: 4px;
                    }
            .snapshot-card .ref-value {
              font - size: 14px;
            color: #9a9a9a;
            line-height: 1.35;
                    }
            .snapshot-icon {
              position: absolute;
            top: 14px;
            right: 14px;
            width: 26px;
            height: 26px;
            border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, #d6f07a, #68b53a);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 0 2px #7aa94d;
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
                    }
            .snapshot-notes {
              display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin: 0 0 18px 0;
            padding: 0;
            list-style: none;
                    }
            .snapshot-notes li {
              display: grid;
            grid-template-columns: 36px 1fr;
            gap: 10px;
            align-items: start;
            font-size: 15px;
            line-height: 1.45;
            color: #111111;
                    }
            .note-bullet {
              width: 26px;
            height: 26px;
            border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
            margin-top: 1px;
                    }
            .basic-grid {
              display: grid;
            grid-template-columns: 260px 1fr 220px;
            gap: 18px;
            align-items: stretch;
            margin-bottom: 14px;
                    }
            .basic-left {
           
            display: grid;
            grid-template-rows: 1fr 1fr;
                    }
            .basic-item {
              display: grid;
            grid-template-columns: 48px 1fr;
            gap: 10px;
            padding: 18px 16px;
            border-bottom: 1px solid #e0e0e0;
            align-items: center;
                    }
            .basic-item:last-child {
              border - bottom: 0;
                    }
            .basic-item .big {
              font - size: 24px;
            font-weight: 800;
                    }
            .basic-item .small {
              font - size: 15px;
            color: #4b4b4b;
            margin-left: 4px;
            font-weight: 700;
                    }
            .obesity-panel {
              background: #ffffff;
            border: 1px solid #e3e3e3;
            padding: 16px;
            position: relative;
                    }
            .obesity-header {
              display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
                    }
            .obesity-title {
              font - size: 16px;
            font-weight: 700;
                    }
            .bmi-label {
              font - size: 15px;
            color: #6a6a6a;
            text-align: center;
                    }
            .bmi-value {
              font - size: 26px;
            font-weight: 900;
            text-align: center;
            margin-top: 4px;
            color: #111111;
                    }
            .bmi-bar {
              height: 14px;
            border-radius: 8px;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.5fr 1.6fr 1.1fr 1.1fr 1fr 1fr;
            margin: 10px 0 6px 0;
                    }
            .bmi-bar div:nth-child(1) {background: #9fb2c2; }
            .bmi-bar div:nth-child(2) {background: #86c43b; }
            .bmi-bar div:nth-child(3) {background: #f4d13e; }
            .bmi-bar div:nth-child(4) {background: #f4a023; }
            .bmi-bar div:nth-child(5) {background: #e3412f; }
            .bmi-bar div:nth-child(6) {background: #b00000; }
            .bmi-pointer {
              position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 86px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #111111;
                    }
            .bmi-labels {
              display: grid;
            grid-template-columns: 1.5fr 1.6fr 1.1fr 1.1fr 1fr 1fr;
            font-size: 12px;
            color: #1c1c1c;
            margin-top: 2px;
                    }
            .bmi-labels span {
              text - align: center;
            white-space: nowrap;
                    }
            .ideal-panel {
             
            display: grid;
            grid-template-columns: 1fr;
            padding: 16px;
            position: relative;
                    }
            .ideal-panel .ideal-title {
              font - size: 16px;
            margin-bottom: 14px;
            line-height: 1.2;
                    }
            .ideal-panel .ideal-value {
              font - size: 26px;
            font-weight: 900;
            text-align: center;
            margin-top: 14px;
                    }
            .bmi-note {
              display: grid;
            grid-template-columns: 36px 1fr;
            gap: 10px;
            align-items: start;
            font-size: 15px;
            line-height: 1.45;
            color: #111111;
            margin-bottom: 0;
            padding-bottom: 12px;
                    }
            .footer {
              border - top: 2px solid #0b8d4a;
            padding: 12px 40px 16px 40px;
            background: #ffffff;
            display: block;
            padding-top: 10px;
            padding-inline: 12px;
                    }
            .footer p {
              margin: 0;
            font-size: 14px;
            color: #777777;
            line-height: 1.4;
                    }
            /* -------- Page 2: In Depth Analysis (exact lookalike) -------- */
            .analysis-page {
              padding: 0;
                    }
            .analysis-header {
              background: #2ea45a;
            color: #ffffff;
            padding: 18px 26px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #c6d600;
                    }
            .analysis-header .brand {
              display: flex;
            align-items: center;
            gap: 10px;
            font-size: 46px;
            font-weight: 900;
            letter-spacing: 2px;
                    }
            .analysis-header .brand-dot {
              width: 18px;
            height: 18px;
            border-radius: 999px;
            background: radial-gradient(circle at 35% 35%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
                    }
            .analysis-inner {
              padding: 22px 26px 0 26px;
                    }
            .analysis-title {
              text - align: center;
            font-size: 24px;
            font-weight: 800;
            color: #0b6b3a;
            text-decoration: underline;
            margin: 10px 0 14px 0;
                    }
            .section-head {
              font - size: 20px;
            font-weight: 800;
            color: #0b6b3a;
            margin: 10px 0 10px 0;
                    }
            .metric-row {
              display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
            background: #f1f1f1;
            overflow: hidden;
            border-radius: 2px;
                    }
            .metric-row.three {
              grid - template - columns: repeat(3, minmax(0, 1fr));
                    }
            .metric-card {
              background: #eeeeee;
            padding: 14px 14px 12px 14px;
            border-right: 1px solid #e0e0e0;
            min-height: 135px;
            position: relative;
                    }
            .metric-card:last-child {
              border - right: 0;
                    }
            .metric-icon {
              position: absolute;
            top: 12px;
            right: 12px;
            width: 26px;
            height: 26px;
            border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: 12px;
                    }
            .metric-label {
              font - size: 16px;
            color: #111111;
            margin-bottom: 8px;
                    }
            .metric-value {
              font - size: 24px;
            font-weight: 900;
            color: #111111;
            margin-bottom: 2px;
                    }
            .metric-unit {
              font - size: 14px;
            color: #2c2c2c;
            font-weight: 700;
            margin-left: 4px;
                    }
            .pill {
              display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            padding: 6px 16px;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.4px;
            background: #ffffff;
            border: 2px solid #d60000;
            color: #d60000;
            margin: 10px 0 10px 0;
            width: max-content;
                    }
            .pill-green {
              border - color: #0b8d4a;
            color: #0b8d4a;
                    }
            .ref-title {
              font - size: 14px;
            color: #7d7d7d;
            margin-bottom: 3px;
                    }
            .ref-value {
              font - size: 14px;
            color: #9a9a9a;
            line-height: 1.35;
                    }
            .note-line {
              display: grid;
            grid-template-columns: 36px 1fr;
            gap: 10px;
            align-items: start;
            font-size: 16px;
            line-height: 1.45;
            color: #111111;
            margin: 10px 0 14px 0;
                    }
            .note-dot {
              width: 26px;
            height: 26px;
            border-radius: 999px;
            background: radial-gradient(circle at 30% 30%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 12px;
            font-weight: 900;
            margin-top: 1px;
                    }
            .split-two {
              display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 22px;
            margin-top: 6px;
                    }
            .two-cards {
              display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            background: #f1f1f1;
            border-radius: 2px;
            overflow: hidden;
                    }
            .metric-card.small {
              min - height: 120px;
                    }
            .analysis-footer {
              border - top: 2px solid #0b8d4a;
            padding: 12px 26px 16px 26px;
            margin-top: 14px;
            color: #777777;
            font-size: 10px;
            line-height: 1.4;
                    }
            /* -------- Page 3: Recommendations (exact lookalike) -------- */
            .reco-page {
              padding: 0;
                    }
            .reco-header {
              background: #2ea45a;
            color: #ffffff;
            padding: 18px 26px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #c6d600;
                    }
            .reco-header .brand {
              display: flex;
            align-items: center;
            gap: 10px;
            font-size: 42px;
            font-weight: 900;
            letter-spacing: 2px;
                    }
            .reco-header .brand-dot {
              width: 18px;
            height: 18px;
            border-radius: 999px;
            background: radial-gradient(circle at 35% 35%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
                    }
            .reco-inner {
              padding: 22px 26px 0 26px;
                    }
            .reco-title {
              text - align: center;
            font-size: 18px;
            font-weight: 900;
            color: #0b6b3a;
            text-decoration: underline;
            margin: 12px 0 18px 0;
                    }
            .reco-intro {
              font - size: 11px;
            color: #1f1f1f;
            margin: 0 0 12px 0;
            font-weight: 700;
                    }
            .reco-box {
            border-radius: 2px;
            overflow: hidden;
            border: 1px solid #ededed;
                    }
            .reco-row {
              display: grid;
            grid-template-columns: 120px 1fr;
            min-height: 120px;
            border-bottom: 26px solid #f6f6f6;
                    }
            .reco-row:last-child {
              border - bottom: 0;
                    }
            .reco-icon-cell {
              display: flex;
            align-items: center;
            justify-content: center;
                    }
            .reco-icon {
              width: 66px;
            height: 66px;
            border-radius: 999px;
            background: radial-gradient(circle at 35% 35%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 5px #b9d651;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: 22px;
                    }
            .reco-content {
              padding: 22px 24px 18px 6px;
                    }
            .reco-heading {
              margin: 0 0 6px 0;
            font-size: 14px;
            font-weight: 900;
            color: #0b6b3a;
                    }
            .reco-content ul {
              margin: 0;
            padding-left: 16px;
            font-size: 12px;
            line-height: 1.45;
            color: #111111;
            font-weight: 600;
                    }
            .reco-banner {
              margin - top: 18px;
            background: #1f9b55;
            color: #ffffff;
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            align-items: center;
            gap: 18px;
            padding: 18px 22px;
                    }
            .reco-banner .headline {
              font - size: 20px;
            font-weight: 900;
            line-height: 1.2;
                    }
            .reco-banner .cta {
              display: grid;
            justify-items: end;
            gap: 8px;
            font-weight: 900;
                    }
            .reco-banner .btn {
              background: #ffffff;
            color: #1f9b55;
            padding: 8px 18px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            width: max-content;
                    }
            .reco-banner .or {
              font - size: 12px;
            opacity: 0.95;
                    }
            .reco-banner .phone {
              font - size: 18px;
            letter-spacing: 0.5px;
                    }
            .reco-disclaimer {
              margin: 10px 0 10px 0;
            font-size: 10px;
            color: #111111;
            font-weight: 700;
                    }
            .reco-footer {
              border - top: 2px solid #0b8d4a;
            padding: 10px 26px 14px 26px;
            color: #777777;
            font-size: 10px;
            line-height: 1.4;
                    }
            /* -------- Page 4: Diet Plan (exact lookalike) -------- */
            .diet4-page {
              padding: 0;
                    }
            .diet4-header {
              background: #2ea45a;
            color: #ffffff;
            padding: 18px 26px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #c6d600;
                    }
            .diet4-header .brand {
              display: flex;
            align-items: center;
            gap: 10px;
            font-size: 42px;
            font-weight: 900;
            letter-spacing: 2px;
                    }
            .diet4-header .brand-dot {
              width: 18px;
            height: 18px;
            border-radius: 999px;
            background: radial-gradient(circle at 35% 35%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 2px #7aa94d;
                    }
            .diet4-inner {
              padding: 10px 26px 0 26px;
                    }
            .diet4-title {
              text - align: center;
            font-size: 24px;
            font-weight: 900;
            color: #0b6b3a;
            text-decoration: underline;
            margin: 14px 0 16px 0;
                    }
            .pref-strip {
             
            padding: 18px 18px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
            margin: 0 auto 18px auto;
                    }
            .pref-item {
              display: flex;
            flex-direction: column;
            gap: 6px;
                    }
            .pref-label {
              font - size: 14px;
            color: #2b2b2b;
                    }
            .pref-value {
              font - size: 14px;
            font-weight: 900;
            color: #111111;
                    }
            .suggest-title {
              text - align: center;
            font-size: 22px;
            font-weight: 900;
            color: #0b6b3a;
            text-decoration: underline;
            margin: 10px 0 18px 0;
                    }
            .suggest-panel {
              background: #e4e64a;
            padding: 24px 22px;
            display: grid;
            grid-template-columns: 1fr 1.1fr;
            gap: 20px;
            margin-bottom: 18px;
                    }
            .targets {
              display: grid;
            gap: 18px;
                    }
            .target-block .tlabel {
              font - size: 12px;
            color: #1b1b1b;
            margin-bottom: 6px;
                    }
            .target-block .tvalue {
              font - size: 22px;
            font-weight: 900;
            color: #111111;
                    }
            .macro-cards {
              display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            align-content: start;
                    }
            .macro-card {
              background: #ffffff;
            display: grid;
            grid-template-columns: 64px 1fr;
            gap: 12px;
            padding: 14px 14px;
            align-items: center;
            border-radius: 2px;
                    }
            .macro-icon {
              width: 48px;
            height: 48px;
            border-radius: 999px;
            background: radial-gradient(circle at 35% 35%, #d6f07a, #68b53a);
            box-shadow: inset 0 0 0 4px #b9d651;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: 18px;
                    }
            .macro-name {
              font - size: 12px;
            color: #111111;
            font-weight: 800;
            margin-bottom: 2px;
                    }
            .macro-val {
              font - size: 12px;
            color: #111111;
            font-weight: 900;
                    }
            .food-panels {
              
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            margin-top: 12px;
                    }
            .food-panel {
              padding: 18px 18px 16px 18px;
            border-right: 2px solid #e0e0e0;
            min-height: 300px;
                    }
            .food-panel:last-child {
              border - right: 0;
                    }
            .food-head {
              font - size: 18px;
            font-weight: 400;
            color: #111111;
            margin-bottom: 10px;
                    }
            .food-panel ul {
              margin: 0;
            padding-left: 18px;
            font-size: 14px;
            line-height: 1.45;
            color: #111111;
                    }
            .food-panel li {
              margin - bottom: 6px;
                    }
            .diet4-footer {
              border - top: 2px solid #0b8d4a;
            padding: 10px 26px 14px 26px;
            color: #777777;
            font-size: 10px;
            line-height: 1.4;
            margin-top: 14px;
                    }
            /* -------- Page 5+: Schedule (7 day diet plan recommendations) -------- */
            .schedule-page {
              padding: 0;
                    }
            .schedule-topbar {
              background: #2ea45a;
            color: #ffffff;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #c6d600;
                    }
            .schedule-brand {
              font - size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
                    }
            .schedule-range {
              text - align: right;
            font-size: 11px;
            font-weight: 800;
            opacity: 0.95;
                    }
            .schedule-inner {
              padding: 12px 18px 0 18px;
                    }
            .schedule-subhead {
              display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            font-size: 11px;
            font-weight: 900;
            color: #111111;
                    }
            .schedule-day {
              font - weight: 900;
                    }
            .schedule-slot {
            margin-top: 10px;
            /* No border */
            border: none;
            border-radius: 4px;
            overflow: hidden;
                    }
            .slot-header {
              background: #68b53a; /* Green Band */
            padding: 8px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: white;
            width: 300px;
            margin: 0 auto;
                      /* Ideally top radius if it touches top, or all radius if floating */
                      /* The image shows a rectangle sitting on top edge */
                    }
            .slot-title {
              font - size: 18px;
            font-weight: 700;
            margin-bottom: 2px;
            color: white;
            text-transform: capitalize;
                    }
            .slot-time {
              display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            font-weight: 700;
            color: white;
            opacity: 1;
                    }
            .slot-body {
              padding: 16px;
                    }
            .choose-title {
              text - align: center;
            font-size: 11px;
            font-weight: 900;
            margin: 6px 0 10px 0;
                    }
            .options-row {
              display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 0; /* Remove gap to make borders touch if desired, or keep small */
                    }
            .options-row.single-row {
              display: flex;
            justify-content: center;
            grid-template-columns: none;
            border-top: none;
                    }
            .options-row.single-row .dish-card {
              border - right: none;
            /* Optional: give it a max-width if it shouldn't be too wide, 
              but 'flex' child width depends on content or flex-basis.
              Let's keep it reasonable. */
            width: 240px;
            flex: none;
                    }
            .dish-card {
            padding: 10px;
            min-height: 140px;
            border-right: 1px solid #d0d0d0;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
                    }
            .dish-card:nth-child(5n), .dish-card:last-child {
              border - right: none;
                    }
            .combos-wrapper {
              display: flex;
            flex-direction: column;
            align-items: stretch;
            margin-top: 10px;
                    }
            .combo-col {
              flex: 1;
            padding: 0 10px;
                    }
            .combo-divider {
              width: 1px;
            background: #d0d0d0;
            margin: 0 4px;
                    }
            .combo-name {
              text - align: center;
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 4px;
                    }
            .dish-img-wrap {
              height: 120px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
                    }
            .dish-img {
              max - height: 120px;
            max-width: 120px;
            object-fit: cover;
            border-radius: 2px;
                    }
            .dish-img.placeholder {
              width: 120px;
            height: 120px;
            border: 1px solid #d2d2d2;
            background: #f7f7f7;
                    }
            .dish-description {
              font - size: 14px;
                    }
            .dish-name {
              font - size: 14px;
            font-weight: 900;
            margin-bottom: 6px;
            color: #111111;
                    }
            .dish-meta {
              font - size: 13px;
            color: #2b2b2b;
            line-height: 1.35;
            font-weight: 500;
                    }
            .plus-divider {
              text - align: center;
            font-size: 20px;
            font-weight: 900;
            padding: 8px 0;
            color: #111111;
                    }
            .schedule-empty {
              padding: 18px;
            text-align: center;
                    }
            .base-card {
              
            padding: 14px;
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 12px;
            border-radius: 2px;
                    }
            .base-img {
              width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 2px;
                    }
            .base-content {
              flex: 1;
            font-size: 15px;
            font-weight: 700;
            color: #111111;
            line-height: 1.4;
                    }
            color: #777;
            font-size: 12px;
            font-weight: 800;
                    }
            .schedule-footer {
              border - top: 2px solid #0b8d4a;
            padding: 10px 18px 14px 18px;
            color: #777777;
            font-size: 10px;
            line-height: 1.4;
            margin-top: 14px;
                    }
          </style>
        </head>
        <body>
          ${coverHtml}

          <div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 15px; padding-top: 0; box-sizing: border-box; position: relative;">
            ${storyHTMLMarkup}
            ${thinkingHTMLMarkup}
            ${nutritionBreakdownHTMLMarkup}
          </div>
          ${(() => {
        const mode = (payload.mode || "weekly").toLowerCase();
        const startDate = payload.cover?.dateTime
          ? new Date(payload.cover.dateTime)
          : new Date();
        const spanDays = mode === "daily" ? 0 : mode === "monthly" ? 29 : 6;
        const endDate = PdfService.addDays(startDate, spanDays);
        const rangeLabel =
          mode === "daily"
            ? PdfService.formatRangeDate(startDate)
            : `${PdfService.formatRangeDate(
              startDate
            )} to ${PdfService.formatRangeDate(endDate)}`;
        const title =
          mode === "weekly"
            ? "7 day diet plan recommendations"
            : `${mode} diet plan recommendations`;

        const filteredSections = daySections.slice(0, mode === "daily" ? 1 : daySections.length);
        return filteredSections
          .map((section, idx) => {
            const scheduleHtml = PdfService.buildScheduleMealsHtml(section.meals);
            const schedulePages = scheduleHtml.split("<!--PAGE_BREAK-->");
            const dayLabel = section.dayLabel || ``;
            return schedulePages
              .map(
                (pageBody, pageIdx) => {
                  const isLastPage = idx === filteredSections.length - 1 && pageIdx === schedulePages.length - 1;
                  const isFirstPage = idx === 0 && pageIdx === 0;
                  return `
                  <div class="page schedule-page"${isFirstPage ? ' style="page-break-before: always;"' : ''}>
                    ${isLastPage ? "" : ""}
                    <div class="schedule-inner">
                      <div class="schedule-subhead">
                        <div style="margin-bottom: 20px; margin-top: 10px;">
        <h2 style="font-size: 24px; font-weight: bold; color: black; border-bottom: 4px solid #4CAF50; display: inline-block; padding-bottom: 8px; margin:0;">Daily Diet Plan Recommendations</h2>
      </div>
                        <div class="schedule-day">${PdfService.escapeHtml(
                    pageIdx === 0 ? dayLabel : `${dayLabel} (cont.)`
                  )}</div>
                      </div>
                      ${pageBody}
                    </div>
                  </div>`;
                }
              )
              .join("");
          })
          .join("");
      })()}
          <script>
            window.onload = function() {
                        const images = document.getElementsByTagName('img');
            for(let img of images) {
              img.onerror = function () {
                this.onerror = null;
                this.src = "${this.PLACEHOLDER_IMAGE}";
              };
            // Trigger check if broken on load
            if(img.naturalWidth === 0) {
              img.src = "${this.PLACEHOLDER_IMAGE}"; 
                          }
                        }
                    };
          </script>
        </body>
      </html>`;
  }
}
