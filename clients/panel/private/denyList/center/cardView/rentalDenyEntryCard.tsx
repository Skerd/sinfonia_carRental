import {compose} from "redux";
import type {RefObject} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconAlertTriangle} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {RentalDenyEntry} from "armonia/src/modules/carRental/api/carRental/private/rentalDenyEntry/rentalDenyEntry.dto.ts";
import RentalDenyEntrySheetView from "@carRentalModule/clients/panel/private/denyList/center/sheetView/rentalDenyEntrySheetView.tsx";
import {rentalDenyEntryEditPath} from "@carRentalModule/clients/panel/private/denyList/index.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

type RentalDenyEntryCardProps = WithLanguageType & {
    rentalDenyEntry: RentalDenyEntry;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: RentalDenyEntry, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<RentalDenyEntry> | null>;
};

function RentalDenyEntryCard({
    rentalDenyEntry,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: RentalDenyEntryCardProps) {
    return (
        <EntityCard
            resource="rentaldenyentries"
            entity={rentalDenyEntry}
            fetchId={fetchId}
            singleUrl="/api/carRental/rentalDenyEntry/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={rentalDenyEntryEditPath}
            Sheet={RentalDenyEntrySheetView}
            sheetEntityProp="rentalDenyEntry"
            deleteUrl="/api/carRental/rentalDenyEntry"
            restoreUrl="/api/carRental/rentalDenyEntry/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="reason"
            innerRef={innerRef}
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="email"
                        title={row.email || row.licenseNumber || ""}
                        badgesBesideTitle
                        badges={!row.isActive ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconAlertTriangle}
                            label={resolveLanguageKey("reason")}
                            tooltip={resolveLanguageKey("reason")}
                            path="reason"
                            value={row.reason}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/carRental/clients/panel/private/denyList/center/cardView/rentalDenyEntryCard.tsx"),
    withDebug(true, true, "rentaldenyentries"),
)(RentalDenyEntryCard);
