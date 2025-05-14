import { useLeaderboard } from "~/hooks/useLeaderboard";
import { strings } from "~/constants/strings";

export const Leaderboard = () => {
  const { daily, weekly, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {strings.leaderboard.title}
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Rankings */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            {strings.leaderboard.daily}
          </h3>
          <div className="space-y-2">
            {daily.length === 0 ? (
              <p className="text-sm text-gray-500">
                {strings.leaderboard.noData}
              </p>
            ) : (
              daily.map((team) => (
                <div
                  key={team.teamName}
                  className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2"
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700"
                    aria-label={strings.leaderboard.rank.replace(
                      "{}",
                      team.rank.toString(),
                    )}
                  >
                    {team.rank}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {team.teamAlias}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {team.point}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Rankings */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            {strings.leaderboard.weekly}
          </h3>
          <div className="space-y-2">
            {weekly.length === 0 ? (
              <p className="text-sm text-gray-500">
                {strings.leaderboard.noData}
              </p>
            ) : (
              weekly.map((team) => (
                <div
                  key={team.teamName}
                  className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2"
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700"
                    aria-label={strings.leaderboard.rank.replace(
                      "{}",
                      team.rank.toString(),
                    )}
                  >
                    {team.rank}
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {team.teamAlias}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {team.point}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
