/**
 * Maps business types to their corresponding dashboard routes.
 * Normalizes the business type (lowercase, trimmed) before matching.
 * 
 * @param businessType - The business type string (can be any case)
 * @returns The dashboard URL path for the given business type
 */
export const getDashboardUrl = (businessType: string): string => {
  const normalizedType = businessType.toLowerCase().trim();
  
  switch (normalizedType) {
    case "restaurant":
      return "/restaurant/dashboard";
    case "clinic":
      return "/clinic/dashboard";
    case "workshop":
      return "/professional-hub";
    case "agro":
      return "/agro/sales/new";
    case "salon":
      return "/dashboard";
    case "washingbay":
      return "/washing-bay/dashboard";
    case "night_parking":
      return "/night-parking/dashboard";
    case "washingbay_nightparking":
      return "/washing-bay/dashboard";
    case "wholesale":
    case "supermarket":
    case "hardware":
    case "pharmacy":
    case "dept_store":
    case "bar":
    case "retail":
      return "/sales/pos";
    default:
      return "/dashboard";
  }
};

