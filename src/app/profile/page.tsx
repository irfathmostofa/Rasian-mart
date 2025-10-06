import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import AddressManager from "@/components/profile/AddressManager";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row p-6 gap-6">
      <ProfileSidebar />
      <div className="flex-1 flex flex-col gap-6">
        <ProfileInfo />
        <AddressManager />
      </div>
    </div>
  );
}
