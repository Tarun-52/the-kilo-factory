"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from 'next-auth/react';


function KitchenGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/kitchen/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'kitchen') {
      router.push('/'); // Kick out normal customers
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xl">Loading Kitchen System...</div>;
  if (!session || session.user?.role !== 'kitchen') return null;

  return <KitchenDashboard />;
}

// Inline Base64 Audio Buzzer (Short beep sound)
const BUZZER_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjqImsSy0eF+aNzXx4qTs3TAycG2r+Hs4+3Yz8vh5ebq6+zr6+nr6evp6unr6+vq6+s=";

export default function KitchenDashboard() {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const prevOrderCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio(BUZZER_SOUND);
  }, []);

  // Fetch Data & Polling
  const fetchOrders = async () => {
    const resNew = await fetch('/api/kitchen/orders?status=placed');
    const resActive = await fetch('/api/kitchen/orders?status=preparing');
    const resDone = await fetch('/api/kitchen/orders?status=delivered');

    const dataNew = await resNew.json();
    const dataActive = await resActive.json();
    const dataDone = await resDone.json();

    // BUZZER LOGIC: If new orders increased, play sound
    if (dataNew.length > prevOrderCount.current && prevOrderCount.current !== 0) {
      audioRef.current?.play().catch(() => {});
    }
    prevOrderCount.current = dataNew.length;

    setNewOrders(dataNew);
    setActiveOrders(dataActive);
    setCompletedOrders(dataDone);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Update Order Status
  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/kitchen/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  // Assign Delivery Partner
  const assignDelivery = async (id: string) => {
    const name = (document.getElementById(`dp-name-${id}`) as HTMLInputElement).value;
    const phone = (document.getElementById(`dp-phone-${id}`) as HTMLInputElement).value;
    if (!name || !phone) return alert("Enter Name and Phone");

    await fetch(`/api/kitchen/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: "out_for_delivery", deliveryPartnerName: name, deliveryPartnerPhone: phone })
    });
    setAssigningId(null);
    fetchOrders();
  };

  const OrderCard = ({ order, type }: { order: any; type: string }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Order: #{order.id.slice(-6).toUpperCase()}</h3>
        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
      </div>
      
      <div className="text-sm text-gray-600">
        <p><b>Customer:</b> {order.user?.name || 'Guest'} ({order.user?.mobile || 'N/A'})</p>
        <p className="truncate"><b>Items:</b> {order.items.map((i: any) => i.itemVariant?.item?.name).join(', ')}</p>
        <p className="font-bold text-maroon mt-1">Total: ₹{order.total}</p>
      </div>

      {type === 'new' && (
        <button onClick={() => updateStatus(order.id, 'preparing')} className="w-full bg-maroon text-white py-2 rounded-lg font-bold hover:bg-maroon-light transition cursor-pointer">
          Accept & Start Preparing
        </button>
      )}

      {type === 'active' && (
        <div className="flex flex-col gap-2">
          {assigningId === order.id ? (
            <div className="flex flex-col gap-1 p-2 border rounded-lg">
              <input id={`dp-name-${order.id}`} placeholder="Delivery Partner Name" className="border p-1.5 rounded text-sm" />
              <input id={`dp-phone-${order.id}`} placeholder="Partner Phone" className="border p-1.5 rounded text-sm" />
              <div className="flex gap-2">
                <button onClick={() => assignDelivery(order.id)} className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm font-bold cursor-pointer">Assign & Send</button>
                <button onClick={() => setAssigningId(null)} className="px-3 bg-gray-200 rounded text-sm cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAssigningId(order.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer">
              Ready - Assign Delivery Partner
            </button>
          )}
        </div>
      )}

      {order.deliveryPartnerName && (
        <div className="text-xs bg-green-50 text-green-700 p-2 rounded border border-green-200">
          🛵 Partner: {order.deliveryPartnerName} ({order.deliveryPartnerPhone})
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">👨‍🍳 Kitchen Display System</h1>
        <button onClick={() => signOut({ callbackUrl: '/kitchen' })} className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-red-200">
          Logout
        </button>
      </header>

      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        {/* New Orders Column */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold mb-3 text-red-600 flex items-center gap-2">
            🔴 New Orders ({newOrders.length})
          </h2>
          <div className="flex flex-col gap-3">
            {newOrders.length === 0 ? <p className="text-gray-400 text-sm">No new orders</p> : newOrders.map(o => <OrderCard key={o.id} order={o} type="new" />)}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold mb-3 text-orange-600 flex items-center gap-2">
            🟠 Preparing ({activeOrders.length})
          </h2>
          <div className="flex flex-col gap-3">
            {activeOrders.length === 0 ? <p className="text-gray-400 text-sm">Nothing preparing</p> : activeOrders.map(o => <OrderCard key={o.id} order={o} type="active" />)}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold mb-3 text-green-600 flex items-center gap-2">
            🟢 Delivered ({completedOrders.length})
          </h2>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            {completedOrders.length === 0 ? <p className="text-gray-400 text-sm">No deliveries yet</p> : completedOrders.map(o => <OrderCard key={o.id} order={o} type="done" />)}
          </div>
        </div>
      </div>
    </div>
  );
}