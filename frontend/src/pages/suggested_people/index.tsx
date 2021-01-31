import { useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import UserCard from "~/components/main/UserCard";
import Loader from "~/components/shared/Loader";
import { UserLoader } from "~/components/shared/Loaders";
import { getSuggestedPeople } from "~/services/api";
import { IError, IProfile } from "~/types/types";

const SuggestedPeople = () => {
    const [people, setPeople] = useState<IProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IError | null>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        fetchSuggested();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSuggested = async () => {
        try {
            setIsLoading(true);
            const users = await getSuggestedPeople({ offset });

            setPeople(users);
            setOffset(offset + 1);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            setError(e);
        }
    }

    const infiniteRef = useInfiniteScroll({
        loading: isLoading,
        hasNextPage: !error && people.length >= 10,
        onLoadMore: fetchSuggested,
        scrollContainer: 'window',
    });

    return (
        <div className="contain min-h-screen w-full py-20">
            <div className="mb-8">
                <h2>Suggested People</h2>
                <p className="text-gray-400 text-sm">Follow people to see their updates</p>
            </div>
            {isLoading && (
                <div className="min-h-10rem px-4">
                    <UserLoader />
                    <UserLoader />
                    <UserLoader />
                    <UserLoader />
                </div>
            )}
            {(!isLoading && error && people.length === 0) && (
                <div className="flex min-h-10rem items-center justify-center">
                    <span className="text-gray-400 italic">
                        {(error as IError)?.error?.message || 'Something went wrong :('}
                    </span>
                </div>
            )}
            <TransitionGroup component={null}>
                <div
                    className="grid grid-cols-1 laptop:grid-cols-2 laptop:gap-x-4"
                    ref={infiniteRef as React.RefObject<HTMLDivElement>}
                >
                    {people.map(user => (
                        <CSSTransition
                            timeout={500}
                            classNames="fade"
                            key={user.id}
                        >
                            <div className="bg-white rounded-md mb-4 shadow-md" key={user.id}>
                                <UserCard
                                    profile={user}
                                    isFollowing={user.isFollowing}
                                />
                            </div>
                        </CSSTransition>
                    ))}
                </div>
            </TransitionGroup>
            {(isLoading && people.length >= 10 && !error) && (
                <div className="px-4 py-14 flex items-center justify-center">
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default SuggestedPeople;
