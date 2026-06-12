import { ModuleStub } from "@/components/shell/ModuleStub";

export default function Page() {
  return (
    <ModuleStub
      area="Health"
      module="Emergency Info"
      icon="🚨"
      note="Locked to Owner/Admin level (per platform--access-control spec §4.8)."
    />
  );
}
