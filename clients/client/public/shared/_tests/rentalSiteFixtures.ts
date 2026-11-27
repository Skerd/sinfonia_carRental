import type {
    RentalQuoteResponse,
    RentalStorefrontCategory,
    RentalStorefrontConfigResponse,
} from "armonia/src/modules/carRental/api/carRental/public/rentalStorefront/rentalStorefront.response.types.ts";

/** A class as the live `rentalStorefront/config` lists it. */
const category = (overrides: Partial<RentalStorefrontCategory>): RentalStorefrontCategory => ({
    _id: "cat1",
    name: "Compact",
    slug: "compact",
    images: ["/a.jpg"],
    videos: [],
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol",
    features: [],
    dailyRate: 49,
    depositAmount: 300,
    mileagePolicy: "unlimited",
    crossBorderAllowed: false,
    soldAsClass: true,
    ...overrides,
});

/** A site with a class sold as one (Compact) and a group that only heads its cars rented on their own (Premium, D198). */
export const SITE_CONFIG: RentalStorefrontConfigResponse = {
    data: {
        company: {name: "Echo Rentals"},
        currency: {_id: "eur", name: "Euro", symbol: "€", abbreviation: "EUR", decimalPlaces: 2},
        paymentPolicy: "pay_at_pickup",
        onlinePaymentAvailable: false,
        guestBookingAllowed: true,
        minRentalHours: 1,
        maxRentalDays: 30,
        minLeadTimeHours: 0,
        maxAdvanceDays: 900,
        freeCancellationHours: 48,
        cancellationFeePercent: 0,
        vatRate: 0,
        pricesIncludeVat: true,
        locations: [{
            _id: "loc1",
            name: "Tirana Airport",
            timezone: "Europe/Tirane",
            openingHours: [],
            closures: [],
            pickupAllowed: true,
            returnAllowed: true,
        }],
        categories: [
            category({}),
            category({_id: "cat2", name: "Premium", slug: "premium", dailyRate: 110, depositAmount: 1500, soldAsClass: false}),
        ],
        cars: [{
            _id: "car1",
            category: "cat2",
            title: "BMW 5 Series",
            make: "BMW",
            model: "5 Series",
            year: 2024,
            color: "Black",
            images: ["/bmw.jpg"],
            dailyRate: 150,
            depositAmount: 1500,
            seats: 5,
            doors: 4,
            transmission: "automatic",
            fuelType: "diesel",
        }],
        extras: [],
    },
};

/** Two days of the BMW, brought from another branch. */
export const CAR_QUOTE: RentalQuoteResponse = {
    data: {
        rentalDays: 2,
        lines: [
            {label: "BMW 5 Series", kind: "rental", quantity: 2, unitPrice: 150, total: 300},
            {label: "Bringing the car from Durrës Port", kind: "fee", code: "car_transfer", quantity: 1, unitPrice: 20, total: 20},
        ],
        subtotal: 320,
        vatRate: 0,
        vatAmount: 0,
        pricesIncludeVat: true,
        grandTotal: 320,
        depositAmount: 1500,
    },
};

export const TRIP = "pickupLocation=loc1&returnLocation=loc1&pickupDate=2099-06-01&pickupTime=10:00&returnDate=2099-06-03&returnTime=10:00";
/** The trip as the site writes it back into its links (URLSearchParams encodes the times). */
export const TRIP_QUERY = new URLSearchParams(TRIP).toString();
