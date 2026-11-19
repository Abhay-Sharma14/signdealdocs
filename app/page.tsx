import {NextIntlClientProvider} from "next-intl";
import HomePage from "@/components/home-page";
import en from "@/messages/en.json";
export default function Page(){return <NextIntlClientProvider locale="en" messages={en}><HomePage/></NextIntlClientProvider>;}
