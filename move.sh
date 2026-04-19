#!/bin/bash
# Move job files
mv src/components/AdminJobManagement.tsx src/components/BranchJobQueue.tsx src/components/CalendarView.tsx src/components/CreateJobOrderDialog.tsx src/components/DescriptionEditor.tsx src/components/FloatingCreateButton.tsx src/components/HighPriorityModal.tsx src/components/JobChat.tsx src/components/JobDetails.tsx src/components/JobForm.tsx src/components/JobList.tsx src/components/JobOrderItemsForm.tsx src/components/JobStatusModal.tsx src/components/QuickCreateModal.tsx src/components/ReportsPage.tsx src/components/jobs/

# Move job subfolders
mv src/components/job-details src/components/job-form src/components/job-list src/components/job-management src/components/jobs/

# Move customer files
mv src/components/CommunicationsManagement.tsx src/components/UserAccessManagement.tsx src/components/UserProfile.tsx src/components/user-profile src/components/customers/

# Move branch files
mv src/components/BranchLogoUploader.tsx src/components/MinimalistSidebar.tsx src/components/SettingsView.tsx src/components/settings src/components/branches/

# Move shared files
mv src/components/AIChecklistPanel.tsx src/components/AdminManagement.tsx src/components/LoginPage.tsx src/components/ModernDashboard.tsx src/components/ProtectedRoute.tsx src/components/admin src/components/dashboard src/components/dropdowns src/components/image-upload src/components/ui src/components/shared/