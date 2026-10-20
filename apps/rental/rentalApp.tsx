import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {lazy, Suspense} from "react";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import {RentalConfigProvider} from "@carRentalModule/clients/client/public/shared/rentalConfigContext.tsx";
import RentalLayout from "@carRentalModule/clients/client/public/shared/rentalLayout.tsx";

const HomePage = lazy(() => import("@carRentalModule/clients/client/public/home/index.tsx"));
const SearchPage = lazy(() => import("@carRentalModule/clients/client/public/search/index.tsx"));
const BookPage = lazy(() => import("@carRentalModule/clients/client/public/book/index.tsx"));
const ManagePage = lazy(() => import("@carRentalModule/clients/client/public/manage/index.tsx"));
const TermsPage = lazy(() => import("@carRentalModule/clients/client/public/terms/index.tsx"));
const NotFoundPage = lazy(() => import("@carRentalModule/clients/client/public/notFound/index.tsx"));

/** Public car rental site: search, book as a guest, manage the booking from the emailed link. */
function RentalApp() {
    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <BrowserRouter>
                    <RentalConfigProvider>
                        <Suspense fallback={<Loader />}>
                            <Routes>
                                <Route element={<RentalLayout />}>
                                    <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                                    <Route path="search" element={<ErrorBoundary><SearchPage /></ErrorBoundary>} />
                                    <Route path="book/:categoryId" element={<ErrorBoundary><BookPage /></ErrorBoundary>} />
                                    <Route path="manage" element={<ErrorBoundary><ManagePage /></ErrorBoundary>} />
                                    <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
                                    <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
                                </Route>
                            </Routes>
                        </Suspense>
                    </RentalConfigProvider>
                </BrowserRouter>
            </LanguageProvider>
            <Toaster closeButton richColors position="bottom-right" duration={2500} />
        </Provider>
    );
}

export default RentalApp;
