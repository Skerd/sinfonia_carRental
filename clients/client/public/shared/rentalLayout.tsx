import {compose} from "redux";
import {Link, Outlet} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {useRentalConfig} from "./rentalConfigContext.tsx";
import {RENT_CARD, RENT_HEADING} from "./rentalStyles.ts";

function RentalLayout({resolveLanguageKey}: WithLanguageType) {
    const {config, loading, unavailable} = useRentalConfig();

    if (loading) return <Loader />;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-rent-border bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <Link to="/" className="flex items-center gap-3">
                        {config?.company.logo ? <img src={config.company.logo} alt="" className="h-9 w-9 rounded-md object-cover" /> : null}
                        <span className={`${RENT_HEADING} text-lg`}>{config?.company.name ?? resolveLanguageKey("fallbackName")}</span>
                    </Link>
                    <nav className="flex items-center gap-5 text-sm font-medium text-rent-ink-muted">
                        <Link to="/" className="hover:text-rent-ink">{resolveLanguageKey("findCar")}</Link>
                        {config?.termsText ? <Link to="/terms" className="hover:text-rent-ink">{resolveLanguageKey("terms")}</Link> : null}
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
                {unavailable ? (
                    <div className={`${RENT_CARD} text-center`}>
                        <h1 className={`${RENT_HEADING} text-2xl`}>{resolveLanguageKey("unavailableTitle")}</h1>
                        <p className="mt-2 text-rent-ink-muted">{resolveLanguageKey("unavailableText")}</p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>

            {config ? (
                <footer className="border-t border-rent-border bg-white">
                    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-rent-ink-muted sm:grid-cols-3">
                        <div>
                            <p className="font-semibold text-rent-ink">{config.company.name}</p>
                            {config.company.phoneNumber ? <p className="mt-1">{config.company.phoneNumber}</p> : null}
                            {config.company.email ? <p>{config.company.email}</p> : null}
                        </div>
                        <div className="sm:col-span-2">
                            <p className="font-semibold text-rent-ink">{resolveLanguageKey("locations")}</p>
                            <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                                {config.locations.map((location) => (
                                    <li key={location._id}>
                                        {location.name}
                                        {location.address ? <span className="text-rent-ink-faded"> · {location.address}</span> : null}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </footer>
            ) : null}
        </div>
    );
}

export default compose(withLanguage("src/modules/carRental/clients/client/public/shared/rentalLayout.tsx"))(RentalLayout);
