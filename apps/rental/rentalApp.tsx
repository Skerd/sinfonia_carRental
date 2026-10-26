import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import RentalSiteRoutes from "@carRentalModule/clients/client/public/shared/rentalSiteRoutes.tsx";

/** Public car rental site: search, book as a guest, manage the booking from the emailed link. */
function RentalApp() {
    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <BrowserRouter>
                    <RentalSiteRoutes />
                </BrowserRouter>
            </LanguageProvider>
            <Toaster closeButton richColors position="bottom-right" duration={2500} />
        </Provider>
    );
}

export default RentalApp;
