import createMiddleware from "next-intl/middleware";
import {routing} from "./i18n/routing";
export default createMiddleware(routing);
// Only localize the marketing home page. Keep API, deal links, dashboard and signing routes intact.
export const config={matcher:["/","/(en|fr|de|ja)"]};
