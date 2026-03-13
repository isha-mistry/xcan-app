import { dbConnect } from '@/lib/dbConnect';
import { College } from '@/models/College';
import { PodMember } from '@/models/PodMember';
import { PodProject } from '@/models/PodProject';
import { WeeklyUpdate } from '@/models/WeeklyUpdate';
import { Deployment } from '@/models/Deployment';
import { LabEvent } from '@/models/LabEvent';
import { UserBadge } from '@/models/UserBadge';
import { LeaderboardScore } from '@/models/LeaderboardScore';
import { ShowcaseSubmission } from '@/models/ShowcaseSubmission';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { BadgeType } from '@/models/BadgeType';
import { PlatformRole } from '@/models/PlatformRole';
import { ProgramMilestone } from '@/models/ProgramMilestone';
import { Region } from '@/models/Region';
import { ShowcaseEvent } from '@/models/ShowcaseEvent';

/**
 * Ensures all required indexes exist.
 * Mongoose auto-creates indexes defined in schemas,
 * but this function is a safety net for production deployments.
 * Call once on app startup.
 */
export async function ensureIndexes(): Promise<void> {
    await dbConnect();

    await Promise.all([
        College.ensureIndexes(),
        PodMember.ensureIndexes(),
        PodProject.ensureIndexes(),
        WeeklyUpdate.ensureIndexes(),
        Deployment.ensureIndexes(),
        LabEvent.ensureIndexes(),
        UserBadge.ensureIndexes(),
        LeaderboardScore.ensureIndexes(),
        ShowcaseSubmission.ensureIndexes(),
        AuditLog.ensureIndexes(),
        Notification.ensureIndexes(),
        BadgeType.ensureIndexes(),
        PlatformRole.ensureIndexes(),
        ProgramMilestone.ensureIndexes(),
        Region.ensureIndexes(),
        ShowcaseEvent.ensureIndexes(),
    ]);

    console.log('[DB] All indexes ensured');
}
