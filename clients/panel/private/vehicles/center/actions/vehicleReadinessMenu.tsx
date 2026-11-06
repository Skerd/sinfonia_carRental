import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {requestFromApi} from "@coreModule/helpers/apiClient/requestFromApi.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconAlertTriangle, IconSparkles} from "@tabler/icons-react";
import type {SetVehicleReadinessResult, Vehicle} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.dto.ts";
import type {VehicleReadiness} from "armonia/src/modules/carRental/api/carRental/private/vehicle/vehicle.schema-def.ts";

type Props = WithLanguageType & {vehicle: Vehicle; onUpdated: (vehicle: Vehicle) => void};

/** Marks a returned car ready again after cleaning, or as needing a check first. */
function VehicleReadinessMenu({vehicle, onUpdated, resolveLanguageKey}: Props) {
    const {write} = useAccess("rentalreservations");
    if (vehicle.deletedAt || !write?.status) return null;
    const set = async (readiness: VehicleReadiness) => {
        try {
            // Outlives the menu; silent here because the catch below reports it, as before.
            const result = await requestFromApi<SetVehicleReadinessResult>({
                method: "post", url: "/api/carRental/vehicle/setReadiness", data: {_id: vehicle._id, readiness}, silent: true,
            });
            onUpdated({...vehicle, readiness: result.readiness});
            toast.success(String(resolveLanguageKey(`done.${readiness}`)));
        } catch (error) {
            handleError(error, {context: "VehicleReadiness"});
        }
    };
    return (
        <>
            {vehicle.readiness !== "ready" ? (
                <DropdownMenuItem onClick={() => { void set("ready"); }}>
                    <IconSparkles size={16} />
                    <p>{resolveLanguageKey("markReady")}</p>
                </DropdownMenuItem>
            ) : null}
            {vehicle.readiness !== "needs_check" ? (
                <DropdownMenuItem onClick={() => { void set("needs_check"); }}>
                    <IconAlertTriangle size={16} />
                    <p>{resolveLanguageKey("markNeedsCheck")}</p>
                </DropdownMenuItem>
            ) : null}
        </>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/vehicles/center/actions/vehicleReadinessMenu.tsx"),
    withDebug(true, true, "vehicles"),
)(VehicleReadinessMenu);
