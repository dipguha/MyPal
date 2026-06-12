import { ModuleStub } from "@/components/shell/ModuleStub";

export default function Page() {
  return (
    <ModuleStub
      area="Finance"
      module="Finance Admin"
      icon="⚙️"
      note="Locked to Owner/Admin (per platform--access-control spec §4.5)."
    />
  );
}
