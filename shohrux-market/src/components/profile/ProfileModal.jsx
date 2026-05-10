import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Edit2, Save, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function ProfileModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSave = async () => {
    const res = await updateProfile(editData);
    if (res.success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) {
      toast.error(t("fill_all_fields"));
      return;
    }
    const res = await changePassword(oldPass, newPass);
    if (res.success) {
      setOldPass("");
      setNewPass("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-slate-800 px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User size={20} className="text-white" />
            <h2 className="text-white font-semibold">{t("my_profile")}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{t("personal_info")}</h3>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm flex items-center gap-1">
                <Edit2 size={14} /> {t("edit_profile")}
              </button>
            ) : (
              <button onClick={handleSave} className="text-green-600 text-sm flex items-center gap-1">
                <Save size={14} /> {t("save_changes")}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">{t("full_name")}</label>
              {isEditing ? (
                <input
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-medium">{user?.full_name || "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500">{t("email")}</label>
              {isEditing ? (
                <input
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-medium">{user?.email || "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500">{t("phone")}</label>
              {isEditing ? (
                <input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-medium">{user?.phone || "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500">{t("address")}</label>
              {isEditing ? (
                <input
                  value={editData.address || ""}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-medium">{user?.address || "-"}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">{t("change_password")}</h3>
            <input
              type="password"
              placeholder={t("old_password")}
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm mb-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder={t("new_password")}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm mb-2 focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleChangePassword} className="w-full py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 transition">
              {t("change_password")}
            </button>
          </div>

          <div className="pt-4 border-t">
            <button onClick={logout} className="w-full py-2 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 transition">
              <LogOut size={18} /> {t("logout")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileModal;