import React, { useEffect, useState } from 'react'
import styles from '../styles/globals.css'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Notification from '@/components/Notification'
import { useRouter } from 'next/router'
import Pusher from "pusher-js";
import { verifyAuth } from "../middlewares/auth";
import Head from 'next/head'

export default function MyApp({ Component, pageProps }) {
  const session = pageProps.session;
  const router = useRouter();
  const [notif, setNotif] = useState({
    msg: '',
    link: '',
    shown: false,
  });

  useEffect(() => {
    if (!session?._id) return;
    fetch(`/api/users/levelup?userId=${session._id}`);
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(`user-${session._id}`);
    channel.bind('new-notif', (data) => {
      let msg;
      switch (data.type) {
        case 'follow': msg = '❤ زوج جديد'; break;
        case 'unfollow': msg = '💔 انفصال جديد'; break;
      }
      setNotif({
        msg: msg,
        link: '/Notifications',
        shown: true,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?._id]);

  return (
    <>
      <Head>
        <title>EconoTSA7IP - {router.pathname === "/" ? "الرئيسية" : router.pathname.replace("/", "").split("?")[0]}</title>
        <meta name="description" content="EconoTSA7IP - موقع العلاقات العاطفية لطلبة كلية الاقتصاد بجامعة الحسن الأول بسطات. مكان للتعارف والتواصل وبناء علاقات جدية وودية." />
        <meta name="keywords" content="حب, صداقة, علاقات, جامعة الحسن الأول, سطات, اقتصاد, طلبة, تعارف, زواج, شباب, فتيات, صداقة جامعية, علاقة حب, كلية الاقتصاد, EconoTSA7IP" />
        <meta name="author" content="Pahae" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta property="og:title" content="EconoTSA7IP - موقع العلاقات العاطفية لطلبة كلية الاقتصاد" />
        <meta property="og:description" content="موقع خاص بالحب والتعارف لطلبة كلية الاقتصاد بسطات (جامعة الحسن الأول)." />
        <meta property="og:image" content="/icon.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_MA" />
      </Head>
      <div dir="rtl" className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {!["/Login", "/Register"].includes(router.pathname) && <Sidebar />}

        <div
          className={`
            lg:mt-0 lg:mb-0
            ${!["/Messages", "/Chat", "/Login", "/Register"].includes(router.pathname) && "mt-14"}
            ${!["/Login", "/Register"].includes(router.pathname) && "mb-24 lg:mr-52"}
          `}
        >
          {!["/Messages", "/Chat", "/Login", "/Register"].includes(router.pathname) && <Header image={session?.img || "/user.jpg"} />}
          <Component {...pageProps} setNotif={setNotif} />
        </div>

        {!["/Login", "/Register"].includes(router.pathname) && <Navbar />}

        <Notification
          message={notif.msg}
          link={notif.link}
          shown={notif.shown}
          onClose={() => setNotif((prev) => ({ ...prev, shown: false }))}
        />
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);
  if (!user) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        img: user.img,
        lvl: user.lvl,
        email: user.email,
        sex: user.sex,
        birth: user.birth,
        createdAt: user.createdAt,
      }
    },
  };

}
