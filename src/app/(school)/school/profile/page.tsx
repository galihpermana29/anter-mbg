import ErrorBoundary from "@/shared/components/ErrorBoundary";
import SekolahIcon from "@/shared/components/icons/SekolahIcon";
import { IResponseProfileSekolah } from "@/shared/models/sekolah";
import { fetchAPI, fetchAPIWithoutToken } from "@/shared/repository/api";
import { getSessionClient } from "@/shared/session/get-session-client";
import { getSession } from "@/shared/session/getter-session";

const ProfileSekolahPage = async () => {
  const data = await getSession();

  const detailSekolah = data
    ? await fetchAPIWithoutToken<IResponseProfileSekolah>(
        `/v1/schools/${data?.user?.school_id}`,
        {
          method: "GET",
        },
        {
          "X-Source": "web",
          "X-User-Id": data?.user_id,
          "X-Kitchen-Id": data?.kitchen_id,
          Authorization: `Bearer ${data?.access_token}`,
        }
      )
    : null;

  if (!detailSekolah) {
    return (
      <ErrorBoundary error={new Error("Error Something Went Wrong")}>
        <div>Error Something Went Wrong</div>
      </ErrorBoundary>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-[8px]">
        <SekolahIcon isActive={true} />
        <h1 className="text-[24px] font-[500]">Profil Sekolah</h1>
      </div>

      {/* School Information Sections */}
      <div className="mt-8 space-y-8">
        {/* Section 1: Informasi Sekolah */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-[18px] font-[600] text-[#030303D9] mb-6">
            Informasi Sekolah
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Nama Sekolah
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.name || "-"}
              </p>
            </div>
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Jenjang
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.category || "-"}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Alamat Sekolah
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.address || "-"}
              </p>
            </div>
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Longitude
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.longitude || "-"}
              </p>
            </div>
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Latitude
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.latitude || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Informasi PIC */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-[18px] font-[600] text-[#030303D9] mb-6">
            Informasi PIC
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Nama
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.contact_person || "-"}
              </p>
            </div>
            <div>
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                No. Whatsapp
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.contact_phone || "-"}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-[16px] font-[500] text-[#030303D9] mb-2">
                Email
              </label>
              <p className="text-[16px] font-[400] text-[#030303D9]">
                {detailSekolah.data.contact_email || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSekolahPage;
