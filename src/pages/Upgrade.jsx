import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function Upgrade() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("獲取用戶資料失敗：", error);
        }
      } else {
        navigate("/entry");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubscriptionSuccess = async (data) => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          isPaid: true,
          subscriptionId: data.subscriptionID,
          updatedAt: new Date()
        });
        alert("訂閱成功！訂閱 ID：" + data.subscriptionID);
        setTimeout(() => navigate("/home"), 2000);
      }
    } catch (error) {
      console.error("更新用戶資料失敗：", error);
      alert("訂閱成功，但更新用戶資料失敗，請聯繫客服。");
    }
  };

  const paypalOptions = {
    "client-id": "Ad3AuDtA09BKpzg32c9pqDgG11j9KMGCU1SO2kqUCR3CVh526IaxZ3GDTA4_pqhh05ZYiDfmmv9eeb6p",
    currency: "TWD",
    intent: "subscription",
    vault: true,
    components: "buttons",
    "data-sdk-integration-source": "button-factory"
  };

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const trialEnd = userData.trialEnds?.toDate() ?? new Date(userData.trialEnds);
  const isTrialExpired = trialEnd && now > trialEnd;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-8">
      <h1 className="text-2xl font-bold mb-4">
        {isTrialExpired ? "試用期已結束" : "即將結束試用期"}
      </h1>
      <p className="mb-6 text-gray-600">
        {isTrialExpired
          ? "您的試用期已經結束，請升級為付費會員以繼續使用我們的服務。"
          : "您的試用期即將結束，請立即升級為付費會員。"}
      </p>
      
      <p className="text-lg font-semibold text-gray-800 mb-4">
        {isTrialExpired ? "升級為付費會員" : "立即升級"}
      </p>

      <div className="w-full max-w-md mx-auto flex justify-center">
        <PayPalScriptProvider options={paypalOptions}>
          <div className="w-full flex justify-center">
            <PayPalButtons
              style={{
                shape: "pill",
                color: "silver",
                layout: "vertical",
                label: "subscribe"
              }}
              createSubscription={(data, actions) => {
                return actions.subscription.create({
                  plan_id: "P-84K534772H596493FNCIFGDY"
                });
              }}
              onApprove={(data, actions) => {
                handleSubscriptionSuccess(data);
                return actions.subscription.get();
              }}
              onError={(err) => {
                alert("訂閱過程中發生錯誤，請稍後再試");
              }}
            />
          </div>
        </PayPalScriptProvider>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        升級後即可享受完整的昆達里尼瑜伽課程體驗
      </p>
    </div>
  );
}

export default Upgrade;