import {compose} from "redux";
import {useNavigate} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useDismissSheetBeforeMenuNavigate} from "@coreModule/components/viewEngine/sheet/widgets/sheetMenuNavigateDismiss.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconBan, IconCalendarEvent, IconCarCrash, IconEngine, IconFileCertificate, IconReceipt2, IconShieldCheck, IconTransfer} from "@tabler/icons-react";
import {vehicleRecordsPath, type VehicleScopeTarget} from "@carRentalModule/clients/panel/vehicleScope.ts";

/** Each record list a car links to: page key, access model, icon. */
const RECORDS = [
    {key: "reservations", model: "rentalreservations", Icon: IconCalendarEvent},
    {key: "maintenance", model: "vehiclemaintenances", Icon: IconEngine},
    {key: "damages", model: "vehicledamages", Icon: IconCarCrash},
    {key: "insurance", model: "vehicleinsurances", Icon: IconShieldCheck},
    {key: "documents", model: "vehicledocuments", Icon: IconFileCertificate},
    {key: "fines", model: "vehiclefines", Icon: IconReceipt2},
    {key: "transfers", model: "vehicletransfers", Icon: IconTransfer},
    {key: "blocks", model: "vehicleblocks", Icon: IconBan},
] as const;

type Props = WithLanguageType & {vehicle: VehicleScopeTarget};

/** Opens a car's bookings, service log, damages, policies, documents, fines, transfers or blocks, each list filtered to that car. */
function VehicleRecordsMenu({vehicle, resolveLanguageKey}: Props) {
    const navigate = useNavigate();
    const dismissSheetIfHosted = useDismissSheetBeforeMenuNavigate();
    const access = {
        rentalreservations: useAccess("rentalreservations"),
        vehiclemaintenances: useAccess("vehiclemaintenances"),
        vehicledamages: useAccess("vehicledamages"),
        vehicleinsurances: useAccess("vehicleinsurances"),
        vehicledocuments: useAccess("vehicledocuments"),
        vehiclefines: useAccess("vehiclefines"),
        vehicletransfers: useAccess("vehicletransfers"),
        vehicleblocks: useAccess("vehicleblocks"),
    };

    return (
        <>
            {RECORDS.filter(({model}) => access[model].read).map(({key, Icon}) => (
                <DropdownMenuItem
                    key={key}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dismissSheetIfHosted?.();
                        navigate(vehicleRecordsPath(key, vehicle, window.location.search));
                    }}
                >
                    <Icon size={16} />
                    <p>{resolveLanguageKey(key)}</p>
                </DropdownMenuItem>
            ))}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicles/center/actions/vehicleRecordsMenu.tsx"),
    withDebug(true, true, "vehicles"),
)(VehicleRecordsMenu);
