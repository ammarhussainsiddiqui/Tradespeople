import React from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useRouter } from 'next/navigation';
import { StarIcon } from 'lucide-react';
import dummyImage from '../app/assets/dummyImage.webp'
import Image from 'next/image';
import { useGlobalState } from '../app/context/GlobalStateContext';

const CardDummy = ({ profiles }) => {
    const router = useRouter();
    const { profileCache, setprofileCache } = useGlobalState();

    const saveToCache = async (profile) => {
        setprofileCache(profile)
        router.push(`/user/hireTradesperson/profile`);
    };

    const sendEmail = (profile) => {
        const subject = encodeURIComponent('Regarding your profile');
        const body = encodeURIComponent(`Hi ${profile.firstName},\n\nI found your profile on our platform and would like to get in touch.\n\nBest regards,\n[Your Name]`);
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="grid gap-4">
            {profiles.map(profile => (
                <Card key={profile?.id} className="bg-surface flex flex-col md:flex-row p-4 gap-2">
                    <div className="">
                        <Image src={dummyImage} alt={profile?.name} className="rounded-2xl md:w-36 md:h-24 w-full h-32 object-cover" />
                    </div>
                    <div className="flex flex-col w-full ">

                        <div className="flex flex-row justify-between items-start md:items-center">
                            <div className="flex md:flex-col flex-row justify-between w-full">
                                <h2 className="text-lg font-bold">{profile?.firstName} {profile?.lastName}</h2>
                                <div className="flex items-center gap-1">
                                    <StarIcon size={15} className="text-accent" />
                                    <p className="text-sm">{profile.rating || 0}/5 (0 reviews)</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 hidden md:block line-clamp-2 h-9 w-fit pr-2 leading-5 ">
                                    {profile?.introduction}
                                </p>
                            </div>

                            <div className="hidden md:block md:flex flex-col gap-2 mt-2 md:mt-0">
                                <Button
                                    onClick={() => { sendEmail(profile.email) }}
                                    variant="default"
                                    className="bg-accent text-accent-foreground hover:bg-accent/90 hover:text-ink-inverse"
                                >
                                    Contact
                                </Button>
                                <Button onClick={() => saveToCache(profile)} variant="outline">View Profile</Button>
                            </div>
                        </div>

                        <div className="block md:hidden flex flex-row gap-2 mt-2 md:mt-0">
                            <Button
                                onClick={() => { sendEmail(profile.email) }}
                                variant="default"
                                className="bg-accent text-accent-foreground hover:bg-accent/90 hover:text-ink-inverse w-1/2"
                            >
                                Contact
                            </Button>
                            <Button className='w-1/2' onClick={() => saveToCache(profile)} variant="outline">View Profile</Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default CardDummy;
