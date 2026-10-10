import React, { useState } from 'react';
import { X, Star, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { RatingReview } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    id: string;
    name: string;
    type: 'pharmacy' | 'nurse' | 'hospital' | 'lab';
    currentRating?: number;
  } | null;
  onSubmitRating: (review: RatingReview) => void;
}

const PRESET_TAGS = [
  'معاملة ممتازة وراقية 🌟',
  'استجابة سريعة ليلاً 🌙',
  'متوفر كافة الأدوية 💊',
  'دقة في المواعيد ⏱️',
  'أسعار نظامية ونظافة فائقة 🧼'
];

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  target,
  onSubmitRating
}) => {
  const [selectedStars, setSelectedStars] = useState(5);
  const [selectedTag, setSelectedTag] = useState(PRESET_TAGS[0]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: RatingReview = {
      id: `rev-${Date.now()}`,
      targetId: target.id,
      targetType: target.type,
      rating: selectedStars,
      comment: comment.trim(),
      tag: selectedTag,
      createdAt: new Date().toISOString()
    };

    onSubmitRating(newReview);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-100 relative"
        style={{ direction: 'rtl' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-black text-slate-900">شكراً لمشاركتك!</h3>
            <p className="text-xs text-slate-500">تم تسجيل تقييمك بنجاح لدعم جودة الرعاية الطبية في دير حافر.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                تقييم الخدمة والرعاية
              </h3>
              <p className="text-xs font-bold text-emerald-700">
                {target.name}
              </p>
            </div>

            {/* Star selector */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedStars(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= selectedStars
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                رأيك الأبرز:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition ${
                      selectedTag === tag
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                تعليق اختياري:
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="شارك تجربتك مع أهالي دير حافر..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-emerald-600 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition active:scale-98"
            >
              إرسال التقييم
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
