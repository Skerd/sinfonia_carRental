import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconCarGarage, IconClock, IconPhone, IconToggleRight} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalLocation} from "armonia/src/modules/carRental/api/carRental/private/rentalLocation/rentalLocation.dto.ts";
import RentalLocationSheetView from "@carRentalModule/clients/panel/private/locations/center/sheetView/rentalLocationSheetView.tsx";
import {rentalLocationEditPath} from "@carRentalModule/clients/panel/private/locations/index.tsx";
import ActivateRentalLocation from "@carRentalModule/clients/panel/private/locations/center/actions/activateRentalLocation.tsx";
import DeactivateRentalLocation from "@carRentalModule/clients/panel/private/locations/center/actions/deactivateRentalLocation.tsx";
import ActivateRentalLocationDialog from "@carRentalModule/clients/panel/private/locations/center/dialogs/activateRentalLocationDialog.tsx";
import DeactivateRentalLocationDialog from "@carRentalModule/clients/panel/private/locations/center/dialogs/deactivateRentalLocationDialog.tsx";

type RentalLocationCardProps = WithLanguageType & {
    rentalLocation: RentalLocation;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalLocation, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalLocation> | null>;
};

function RentalLocationCard({
    rentalLocation,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: RentalLocationCardProps) {
    return (
        <EntityCard
            resource="rentallocations"
            entity={rentalLocation}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalLocation/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalLocationEditPath}
            Sheet={RentalLocationSheetView}
            sheetEntityProp="rentalLocation"
            deleteUrl="/api/carRental/rentalLocation"
            restoreUrl="/api/carRental/rentalLocation/restore"
            failedTitle={String(resolveLanguageKey("failedTitle"))}
            failedDescription={String(resolveLanguageKey("failedDescription"))}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<RentalLocation>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateRentalLocation" && (
                        <ActivateRentalLocationDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateRentalLocation" && (
                        <DeactivateRentalLocationDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name}>
                        <ActivateRentalLocation entity={row} onAction={setAction} />
                        <DeactivateRentalLocation entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconClock}
                            label={resolveLanguageKey("timezone")}
                            tooltip={resolveLanguageKey("timezone")}
                            path="timezone"
                            value={row.timezone}
                        />
                        <EntityCardRow
                            icon={IconPhone}
                            label={resolveLanguageKey("phone")}
                            tooltip={resolveLanguageKey("phone")}
                            path="phone"
                            value={row.phone}
                        />
                        <EntityCardRow
                            icon={IconCarGarage}
                            label={resolveLanguageKey("pickupAllowed")}
                            tooltip={resolveLanguageKey("pickupAllowed")}
                            path="pickupAllowed"
                            type="boolean"
                            value={row.pickupAllowed}
                        />
                        <EntityCardRow
                            icon={IconToggleRight}
                            label={resolveLanguageKey("isActive")}
                            tooltip={resolveLanguageKey("isActive")}
                            path="isActive"
                            type="boolean"
                            value={row.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/locations/center/cardView/rentalLocationCard.tsx"),
    withDebug(true, true, "rentallocations"),
)(RentalLocationCard);
