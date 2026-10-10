import React, { useState } from 'react';
import { X, Heart, Phone, AlertTriangle, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BloodDonationRequest, BloodGroup } from '../types';

interface BloodDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: BloodDonationRequest[];
  onAddRequest: (req: BloodDonationRequest) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const BloodDonationModal: React.FC<BloodDonationModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAddRequest
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New request form state
  const [patientName, setPatientName] = useState('');
  const [bloodType, setBloodType] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgency, setUrgency] = useState<'critical' | 'urgent' | 'moderate'>('critical');
  const [hospitalName, setHospitalName] = useState('مشفى دير حافر / نقطة الإسعاف');
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredRequests = requests.filter((r) => {
    if (selectedGroup === 'all') return true;
    return r.bloodType === selectedGroup;
  });

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !contactPhone.trim()) return;

    const newReq: BloodDonationRequest = {
      id: `bld-${Date.now()}`,
      patientName: patientName.trim(),
      bloodType,
      unitsNeeded: Number(unitsNeeded) || 1,
      urgency,
      hospitalName: hospitalName.trim() || 'دير حافر',
      contactPhone: contactPhone.trim(),
      contactName: contactName.trim() || 'ذوي المريض',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      isFulfilled: false
    };

    onAddRequest(newReq);
    setIsAddingNew(false);
    // Reset form
    setPatientName('');
    setContactPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-rose-100"
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-800 via-rose-700 to-red-800 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
              <Heart className="w-5 h-5 text-rose-200 fill-rose-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black">نداءات التبرع بالدم العاجلة 🩸</h2>
              <p className="text-[11px] text-rose-200 font-medium">
                دير حافر والمشافي القريبة • إنقاذ حياة مريض
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button & Blood Group filter pills */}
        <div className="p-3 bg-rose-50/50 border-b border-rose-100 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">تصفية حسب زمرة الدم:</span>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'إلغاء' : 'طلب نداء دم جديد'}</span>
            </button>
          </div>

          {/* Group pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedGroup === 'all'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
              }`}
            >
              كافة الزمر
            </button>
            {BLOOD_GROUPS.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedGroup === grp
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* New Request Form Modal/Collapsible */}
          {isAddingNew && (
            <form
              onSubmit={handleSubmitNew}
              className="bg-white rounded-2xl p-3.5 border-2 border-rose-200 shadow-md space-y-3 animate-fadeIn mb-3"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>إضافة نداء تبرع عاجل بالدم</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    حالة المريض / الاسم:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثال: مريض حادث سير"
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-rose-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    زمرة الدم المطلوبة:
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as BloodGroup)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-rose-600 font-black text-rose-800"
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    درجة الاستعجال:
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'critical' | 'urgent' | 'moderate')}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="critical">حرجة جداً 🔴</option>
                    <option value="urgent">عاجلة 🟠</option>
                    <option value="moderate">متوسطة 🟡</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    عدد الأكياس المطلوبة:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    المشفى / المركز:
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="اسم المشفى"
                    className="w-full text-xs p-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    رقم هاتف الاتصال:
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="رقم للتواصل السريع"
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 font-bold text-rose-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  تفاصيل إضافية:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول الحالة أو مكان التبرع"
                  className="w-full text-xs p-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-700 hover:bg-rose-800 text-white font-black text-xs py-2.5 rounded-xl shadow transition active:scale-98"
              >
                نشر النداء فوراً في المنصة 📢
              </button>
            </form>
          )}

          {/* List of blood requests */}
          {filteredRequests.length === 0 ? (
            <div className="bg-rose-50/50 rounded-2xl p-6 text-center border border-rose-100 text-slate-600">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-xs text-slate-800">
                الحمد لله، لا توجد نداءات حرجة مسجلة لهذه الزمرة حالياً.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                يمكنك التبرع الوقائي في المركز الصحي بدير حافر أو مشفى المنطقة.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isCrit = req.urgency === 'critical';
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all shadow-2xs space-y-2.5 ${
                    isCrit ? 'border-rose-300 ring-1 ring-rose-100' : 'border-slate-200'
                  }`}
                >
                  {/* Top line: Blood badge, Patient, Urgency */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex flex-col items-center justify-center font-black shadow-xs shrink-0">
                        <span className="text-sm leading-none">{req.bloodType}</span>
                        <span className="text-[8px] opacity-80 mt-0.5">زمرة</span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                          {req.patientName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          الموقع: <span className="font-bold text-slate-700">{req.hospitalName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      {isCrit ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          حالة حرجة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          عاجل
                        </span>
                      )}
                      <span className="block text-[10px] font-bold text-slate-600 mt-1 text-right">
                        المطلوب: {req.unitsNeeded} كيس
                      </span>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {req.notes && (
                    <p className="text-xs bg-slate-50 p-2 rounded-xl text-slate-700 border border-slate-100 leading-relaxed font-medium">
                      {req.notes}
                    </p>
                  )}

                  {/* Action row: Phone call button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      التواصل: {req.contactName}
                    </span>
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>اتصال للمساعدة: {req.contactPhone}</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
