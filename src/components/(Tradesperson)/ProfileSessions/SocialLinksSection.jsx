"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Trash2, Plus } from "lucide-react";
import Spinner from "../../Spinner";
toast

import { getUserDetails } from "../../../actions/auth";
import { toast } from "react-toastify";

const socialOptions = [
  { name: "WhatsApp", icon: "https://app.tradepeople.co.uk/images/whatsapp.webp" },
  { name: "Facebook", icon: "https://app.tradepeople.co.uk/images/facebook.webp" },
  { name: "Instagram", icon: "https://app.tradepeople.co.uk/images/Instagram.webp" },
  { name: "YouTube", icon: "https://app.tradepeople.co.uk/images/youtube.webp" },
  { name: "LinkedIn", icon: "https://app.tradepeople.co.uk/images/LinkedIn.webp" },
  { name: "Pinterest", icon: "https://app.tradepeople.co.uk/images/Pinterest.webp" },
  { name: "X", icon: "https://app.tradepeople.co.uk/images/X.webp" },
  { name: "Dribbble", icon: "https://app.tradepeople.co.uk/images/Dribbble.webp" },
  { name: "Benhance", icon: "https://app.tradepeople.co.uk/images/Behance.webp" },
  { name: "Slack", icon: "https://app.tradepeople.co.uk/images/Slack.webp" },
  { name: "Reddit", icon: "https://app.tradepeople.co.uk/images/Reddit.webp" },
];

export default function SocialMediaSection() {
  const [selected, setSelected] = useState(socialOptions[0]);
  const [link, setLink] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUserAndLinks() {
      setLoading(true);
      const user = await getUserDetails();
      if (user?.id) {
        setUserId(user.id);
        const res = await fetch(`/api/social-links?id=${user.id}`);
        const data = await res.json();
        setSocialLinks(data?.links || []);
      }
      setLoading(false);
    }

    fetchUserAndLinks();
  }, []);

  const formatUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const isValidUrl = (url) => {
    const pattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    return pattern.test(url);
  };
  const handleAddLink = async () => {
    if (!userId || link.trim() === "") return;

    let formattedLink = link.trim();

    if (selected.name === "WhatsApp") {
      // Remove non-numeric characters
      const phoneNumber = formattedLink.replace(/\D/g, "");

      if (phoneNumber.length < 8) {
        toast.warning("Please enter a valid WhatsApp number", {
          position: "top-center",
        });
        return;
      }

      formattedLink = `https://wa.me/${phoneNumber}`;
    } else {
      formattedLink = formatUrl(formattedLink);

      if (!isValidUrl(formattedLink)) {
        toast.warning("Please enter a valid URL (e.g. https://example.com)", {
          position: "top-center",
        });
        return;
      }
    }

    // Check for duplicates
    const alreadyExists = socialLinks.some(
      (linkItem) => linkItem.name === selected.name
    );

    if (alreadyExists) {
      toast.warning(`${selected.name} link already added`, {
        position: "top-center",
      });
      return;
    }

    setSubmitting(true);

    const body = {
      name: selected.name,
      icon: selected.icon,
      link: formattedLink,
    };

    try {
      const res = await fetch(`/api/social-links?id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add link");

      const data = await res.json();
      setSocialLinks(data?.links || []);
      setLink("");
    } catch (err) {
      toast.error("Failed to add social media link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (name) => {
    if (!userId) return;
    const res = await fetch(`/api/social-links?id=${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setSocialLinks(data?.links || []);
  };

  if (loading) {
    return (
      <section className="py-6 w-full my-10 text-center mx-auto text-lg text-neutral-600">
        <Spinner className="mx-auto" />
      </section>
    );
  }

  return (
    <section className="py-6 w-full my-10">
      <h2 className="text-2xl font-bold mb-4">Social Media Links</h2>

      <div className="flex flex-col w-full md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-row items-center w-full md:w-1/5 justify-between gap-4">
          <select
            onChange={(e) =>
              setSelected(socialOptions.find((opt) => opt.name === e.target.value))
            }
            className="border p-2 rounded-md w-full md:w-3/4"
            value={selected.name}
          >
            {socialOptions.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>

          <Image
            src={selected.icon}
            alt={selected.name}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div className="flex flex-row items-center w-full md:w-4/5 justify-between gap-4">

          <Input
            placeholder={`Enter ${selected.name} ${selected.name === "WhatsApp" ? "number" : "link"}`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="flex-1"
          />
          <button className="px-4 py-2  bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-primary hover:text-ink-inverse transition duration-200" onClick={handleAddLink}>
            {submitting ? <Spinner /> : 'Add'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {socialLinks.map((item, index) => (
          <Card key={index} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src={item.icon}
                  alt={item.icon}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="font-medium">{item.name}:</span>
                <span className="text-info-soft-foreground underline break-all ml-1">{item.link}</span>
              </a>
            </div>
            <Trash2
              size={20}
              onClick={() => handleDelete(item.name)}
            />
          </Card>
        ))}
      </div>
    </section>
  );
}


