import { cn } from '@/lib/utils';
import type { ProjectStage } from '@/types/database';

interface StageIndicatorProps {
  currentStage: ProjectStage;
}

const stages: { id: ProjectStage; label: string }[] = [
  { id: 'draft', label: '草稿' },
  { id: 'scenes', label: '分镜' },
  { id: 'images', label: '图片' },
  { id: 'videos', label: '视频' },
  { id: 'completed', label: '完成' },
];

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-0">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium',
                  isCompleted && 'bg-green-600 text-white',
                  isCurrent && 'bg-blue-600 text-white',
                  !isCompleted && !isCurrent && 'bg-gray-700 text-gray-400'
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'sm:ml-2 text-xs sm:text-sm',
                  isCurrent ? 'text-white font-medium' : 'text-gray-400'
                )}
              >
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'hidden sm:block w-4 lg:w-8 h-0.5 mx-1 lg:mx-2',
                  index < currentIndex ? 'bg-green-600' : 'bg-gray-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
