
import { useState, useEffect } from "react";
import { Job } from "@/pages/Index";

interface CylindricalJobSliderProps {
  jobs: Job[];
  selectedIndex: number;
  onJobSelect: (index: number) => void;
}

export function CylindricalJobSlider({ jobs, selectedIndex, onJobSelect }: CylindricalJobSliderProps) {
  const [currentDay, setCurrentDay] = useState(selectedIndex);

  useEffect(() => {
    setCurrentDay(selectedIndex);
  }, [selectedIndex]);

  const adjustDay = (direction: number) => {
    const newIndex = Math.max(0, Math.min(jobs.length - 1, currentDay + direction));
    setCurrentDay(newIndex);
    onJobSelect(newIndex);
  };

  const getJobColor = (job: Job, index: number) => {
    const hue = (360 / jobs.length) * index;
    const isActive = index === currentDay;
    const lightness = isActive ? 30 : 50;
    return `hsl(${hue}, 50%, ${lightness}%)`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "hsl(0, 70%, 50%)";
      case "medium": return "hsl(30, 70%, 50%)";
      case "low": return "hsl(120, 70%, 50%)";
      default: return "hsl(200, 50%, 50%)";
    }
  };

  return (
    <div className="relative w-full h-96 overflow-hidden">
      <style>{`
        .cylinder-container {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 900px;
          transform-style: preserve-3d;
        }
        
        .cylinder-list {
          list-style: none;
          width: 100%;
          height: 100%;
          position: relative;
          perspective: 900px;
          transform-style: preserve-3d;
        }
        
        .cylinder-item {
          position: absolute;
          left: 50%;
          top: calc(50% - 1.2rem);
          width: 85%;
          height: 2.8rem;
          display: grid;
          grid-template-columns: 4rem auto 2rem;
          align-items: center;
          border-radius: 8px;
          transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }
        
        .cylinder-item.active {
          transform: rotateX(0deg) translateZ(190px) translateX(-50%) scale(1.15);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .job-number {
          text-align: center;
          font-weight: bold;
          font-size: 0.9rem;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .job-title {
          padding: 0 0.75rem;
          color: white;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 auto;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        }
        
        .border-frame {
          width: 90%;
          height: 3.2em;
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 12px;
          background: linear-gradient(45deg, 
            rgba(255, 255, 255, 0.05), 
            rgba(255, 255, 255, 0.02));
        }
        
        .controls {
          position: absolute;
          top: 50%;
          right: -3rem;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 10;
        }
        
        .control-button {
          width: 2.5rem;
          height: 2.5rem;
          font-size: 1.2rem;
          color: white;
          border: none;
          background: linear-gradient(145deg, #4f46e5, #3730a3);
          border-radius: 50%;
          display: grid;
          place-items: center;
          transition: all 200ms ease;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          cursor: pointer;
        }
        
        .control-button:hover {
          background: linear-gradient(145deg, #6366f1, #4f46e5);
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
        }
        
        .control-button:active {
          transform: scale(0.95);
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="cylinder-container">
        <ul className="cylinder-list">
          {jobs.map((job, index) => {
            const rotateX = 15 * (index - currentDay);
            const isActive = index === currentDay;
            
            return (
              <li
                key={job.id}
                className={`cylinder-item ${isActive ? 'active' : ''}`}
                style={{
                  transform: isActive 
                    ? `rotateX(0deg) translateZ(190px) translateX(-50%) scale(1.15)`
                    : `rotateX(${rotateX}deg) translateZ(190px) translateX(-50%) scale(1)`,
                  backgroundColor: getJobColor(job, index),
                  backgroundImage: `linear-gradient(135deg, 
                    ${getJobColor(job, index)}, 
                    ${getJobColor(job, index).replace('50%', '35%')})`
                }}
                onClick={() => {
                  setCurrentDay(index);
                  onJobSelect(index);
                }}
              >
                <div className="job-number">
                  #{job.jobOrderNumber}
                </div>
                <div className="job-title">
                  {job.title}
                </div>
                <div 
                  className="priority-dot"
                  style={{ backgroundColor: getPriorityColor(job.priority) }}
                  title={`${job.priority} priority`}
                />
              </li>
            );
          })}
        </ul>

        <div className="border-frame"></div>

        <div className="controls">
          <button
            className="control-button"
            onClick={() => adjustDay(-1)}
            disabled={currentDay === 0}
            title="Previous job"
          >
            ▲
          </button>
          <button
            className="control-button"
            onClick={() => adjustDay(1)}
            disabled={currentDay === jobs.length - 1}
            title="Next job"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
