import { Banknote, CheckCircle2, Clock, ArrowLeft, Download, Phone } from 'lucide-react';
import { FarmerLayout } from '@/components/layouts/FarmerLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaymentBadge } from '@/components/ui/Badge';
import { useApp } from '@/store/AppContext';
import { useRouter } from '@/store/Router';


export function PaymentDetailScreen() {
  const { params, goBack } = useRouter();
  const { getBooking, farmers } = useApp();
  const booking = getBooking(params.bookingId);

  if (!booking) return null;

  const farmer = farmers.find((f) => f.id === booking.farmerId);
  const isPaid = booking.paymentStatus === 'paid';
  const isProcessing = booking.paymentStatus === 'processing';

  return (
    <FarmerLayout title="Payment Details" showBack>
      {/* Payment status hero */}
      <Card className="mb-4 overflow-hidden">
        {isPaid ? (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-3xl font-extrabold">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
            <p className="text-white/90 mt-1">Payment Completed</p>
            <p className="text-sm text-white/70 mt-2">Credited via DBT</p>
          </div>
        ) : isProcessing ? (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-3xl font-extrabold">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
            <p className="text-white/90 mt-1">Payment Processing</p>
            <p className="text-sm text-white/70 mt-2">DBT in progress · 24-48 hrs</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-neutral-400 to-neutral-500 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Banknote size={32} />
            </div>
            <p className="text-3xl font-extrabold">₹{booking.totalAmount?.toLocaleString('en-IN') ?? '—'}</p>
            <p className="text-white/90 mt-1">Payment Pending</p>
          </div>
        )}
      </Card>

      {/* Payment breakdown */}
      {booking.totalAmount && (
        <Card className="mb-4">
          <div className="p-5">
            <h3 className="font-bold text-neutral-800 mb-4">Payment Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Crop</span>
                <span className="font-semibold text-neutral-700">{booking.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Actual Weight</span>
                <span className="font-semibold text-neutral-700">{booking.weighedQuantity} quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rate per Quintal</span>
                <span className="font-semibold text-neutral-700">₹{booking.ratePerQuintal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Quality Grade</span>
                <span className="font-semibold text-neutral-700">{booking.qualityGrade}</span>
              </div>
              <div className="border-t border-neutral-100 pt-3 flex justify-between">
                <span className="font-bold text-neutral-800">Total Amount</span>
                <span className="font-bold text-primary-600 text-lg">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bank details */}
      <Card className="mb-4">
        <div className="p-5">
          <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <Banknote size={18} className="text-primary-600" />
            Bank Account Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Account Number</span>
              <span className="font-semibold text-neutral-700">{farmer?.bankAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Bank Name</span>
              <span className="font-semibold text-neutral-700">{farmer?.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">IFSC Code</span>
              <span className="font-semibold text-neutral-700">{farmer?.ifsc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Method</span>
              <span className="font-semibold text-neutral-700">{booking.paymentMethod}</span>
            </div>
            {booking.paymentRefNo && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Reference No.</span>
                <span className="font-semibold text-primary-600">{booking.paymentRefNo}</span>
              </div>
            )}
            {booking.paymentDate && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Date</span>
                <span className="font-semibold text-neutral-700">
                  {new Date(booking.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="mb-4">
        <div className="p-5">
          <h3 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-primary-600" />
            Payment Timeline
          </h3>
          <div className="space-y-3">
            {booking.history.filter((h) => ['procured', 'payment_processing', 'paid'].includes(h.status)).map((event, idx, arr) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${idx === arr.length - 1 ? 'bg-primary-600' : 'bg-primary-300'}`} />
                  {idx < arr.length - 1 && <div className="w-0.5 h-6 bg-neutral-200" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-700">{event.label}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(event.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.note && <p className="text-xs text-neutral-500 mt-0.5">{event.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isPaid && (
        <Button fullWidth variant="outline" size="lg" onClick={() => {}}>
          <Download size={18} /> Download Receipt
        </Button>
      )}

      {isProcessing && (
        <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
          <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Payment in Progress</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Your payment is being transferred to your bank account via DBT. This usually takes 24-48 hours.
              If you don't receive payment within 48 hours, please contact the centre.
            </p>
          </div>
        </div>
      )}
    </FarmerLayout>
  );
}
