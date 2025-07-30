
import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateJobOrderDialog } from "@/components/CreateJobOrderDialog";

export function FloatingCreateButton() {
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsCreateJobDialogOpen(true)}
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Create New Job Order"
      >
        <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <CreateJobOrderDialog
        open={isCreateJobDialogOpen}
        onOpenChange={setIsCreateJobDialogOpen}
      />
    </>
  );
}
