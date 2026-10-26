import {lazy, Suspense} from "react";
import {Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {RentalConfigProvider} from "@carRentalModule/clients/client/public/shared/rentalConfigContext.tsx";
import RentalLayout from "@carRentalModule/clients/client/public/shared/rentalLayout.tsx";

const HomePage = lazy(() => import("@carRentalModule/clients/client/public/home/index.tsx"));
const SearchPage = lazy(() => import("@carRentalModule/clients/client/public/search/index.tsx"));
const BookPage = lazy(() => import("@carRentalModule/clients/client/public/book/index.tsx"));
const ManagePage = lazy(() => import("@carRentalModule/clients/client/public/manage/index.tsx"));
const TermsPage = lazy(() => import("@carRentalModule/clients/client/public/terms/index.tsx"));
const NotFoundPage = lazy(() => import("@carRentalModule/clients/client/public/notFound/index.tsx"));

/**
 * One rental company's site: search, book as a guest, manage the booking from the emailed
 * link. Served by the rental app at the root and by the portal under `/car-rental/<company>`.
 */
export default function RentalSiteRoutes() {
    return (
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
    );
}
