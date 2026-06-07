import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import h5Styles from './index.h5.module.scss';

const isH5 = process.env.TARO_ENV === 'h5';
const useStyles = isH5 ? h5Styles : styles;

const storage = {
  get: (key: string) => {
    if (isH5) {
      try {
        return JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        return null;
      }
    }
    try {
      return wx.getStorageSync(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (isH5) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      wx.setStorageSync(key, value);
    }
  },
  remove: (key: string) => {
    if (isH5) {
      localStorage.removeItem(key);
    } else {
      wx.removeStorageSync(key);
    }
  }
};

const showToast = (title: string, icon: 'success' | 'none' = 'none') => {
  if (!isH5) {
    wx.showToast({ title, icon });
  }
};

type ModeType = 'modeA' | 'modeB';

interface SelectedNumbers {
  reds: number[];
  blues: number[];
}

const MODE_CONFIG = {
  modeA: {
    name: '非常6+1',
    desc: '前区6个 + 后区1个',
    redCount: 6,
    redMax: 33,
    blueCount: 1,
    blueMax: 16,
    redLabel: '前区',
    blueLabel: '后区',
    mode: 'modeA'
  },
  modeB: {
    name: '幸运52',
    desc: '前区5个 + 后区2个',
    redCount: 5,
    redMax: 35,
    blueCount: 2,
    blueMax: 12,
    redLabel: '前区',
    blueLabel: '后区',
    mode: 'modeB'
  }
};

const generateRandomNumbers = (count: number, max: number): number[] => {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * max) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

const SelectedItem: React.FC<{
  index: number;
  item: SelectedNumbers;
  onDelete: () => void;
}> = ({ index, item, onDelete }) => {
  return (
    <View className={useStyles.numberItem}>
      <View className={useStyles.itemIndex}>
        <Text>{index + 1}</Text>
      </View>
      <View className={useStyles.balls}>
        {item.reds.map((num) => (
          <View key={`red-${num}`} className={`${useStyles.ball} ${useStyles.redBall}`}>
            <Text className={useStyles.ballText}>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
        {item.blues.map((num) => (
          <View key={`blue-${num}`} className={`${useStyles.ball} ${useStyles.blueBall}`}>
            <Text className={useStyles.ballText}>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
      </View>
      <View className={useStyles.deleteBtn} onClick={onDelete}>
        <Text>×</Text>
      </View>
    </View>
  );
};

const ModeColumn: React.FC<{
  mode: ModeType;
  selectedReds: number[];
  selectedBlues: number[];
  savedList: SelectedNumbers[];
  onRedClick: (num: number) => void;
  onBlueClick: (num: number) => void;
  onRandomReds: () => void;
  onRandomBlues: () => void;
  onClearReds: () => void;
  onClearBlues: () => void;
  onDelete: (index: number) => void;
  onClear: () => void;
  onSave: () => void;
}> = ({
  mode,
  selectedReds,
  selectedBlues,
  savedList,
  onRedClick,
  onBlueClick,
  onRandomReds,
  onRandomBlues,
  onClearReds,
  onClearBlues,
  onDelete,
  onClear,
  onSave
}) => {
  const cfg = MODE_CONFIG[mode];
  const canSave = selectedReds.length === cfg.redCount && selectedBlues.length === cfg.blueCount;

  return (
    <View className={useStyles.modeColumn}>
      <View className={`${useStyles.columnHeader} ${useStyles[mode]}`}>
        <Text className={useStyles.modeName}>{cfg.name}</Text>
        <Text className={useStyles.modeDesc}>{cfg.desc}</Text>
        <Text className={useStyles.savedCount}>{savedList.length} / 15 组已选</Text>
      </View>

      <View className={useStyles.columnBody}>
        {/* 前区选择 */}
        <View className={useStyles.section}>
          <View className={useStyles.sectionHeader}>
            <View className={useStyles.sectionTitle}>
              <View className={useStyles.redDot}></View>
              <Text className={useStyles.titleText}>{cfg.redLabel}</Text>
            </View>
            <Text className={useStyles.progress}>{selectedReds.length} / {cfg.redCount}</Text>
          </View>

          <View className={useStyles.numberGrid}>
            {Array.from({ length: cfg.redMax }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${useStyles.numberBall} ${selectedReds.includes(num) ? useStyles.selected : ''}`}
                onClick={() => onRedClick(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>

          <View className={useStyles.buttonRow}>
            <View className={`${useStyles.actionBtn} ${useStyles.primary}`} onClick={onRandomReds}>
              <Text>随机选择</Text>
            </View>
            <View className={`${useStyles.actionBtn} ${useStyles.secondary}`} onClick={onClearReds}>
              <Text>清空</Text>
            </View>
          </View>
        </View>

        {/* 后区选择 */}
        <View className={useStyles.section}>
          <View className={useStyles.sectionHeader}>
            <View className={useStyles.sectionTitle}>
              <View className={useStyles.blueDot}></View>
              <Text className={useStyles.titleText}>{cfg.blueLabel}</Text>
            </View>
            <Text className={useStyles.progress}>{selectedBlues.length} / {cfg.blueCount}</Text>
          </View>

          <View className={useStyles.numberGrid}>
            {Array.from({ length: cfg.blueMax }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${useStyles.numberBall} ${useStyles.blue} ${selectedBlues.includes(num) ? useStyles.selected : ''}`}
                onClick={() => onBlueClick(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>

          <View className={useStyles.buttonRow}>
            <View className={`${useStyles.actionBtn} ${useStyles.primary}`} onClick={onRandomBlues}>
              <Text>随机选择</Text>
            </View>
            <View className={`${useStyles.actionBtn} ${useStyles.secondary}`} onClick={onClearBlues}>
              <Text>清空</Text>
            </View>
          </View>
        </View>

        {/* 保存按钮 */}
        <View className={useStyles.section}>
          <View className={`${useStyles.actionBtn} ${useStyles.primary}`} onClick={onSave} disabled={!canSave}>
            <Text>{canSave ? '保存选号' : `请选择${cfg.redCount}个前区和${cfg.blueCount}个后区`}</Text>
          </View>
        </View>

        {/* 已选号码区域 */}
        <View className={useStyles.section}>
          <View className={useStyles.savedSection}>
            <View className={useStyles.sectionHeader}>
              <View className={useStyles.sectionTitle}>
                <View className={mode === 'modeA' ? useStyles.redDot : useStyles.blueDot}></View>
                <Text className={useStyles.titleText}>已选号码</Text>
              </View>
              <Text className={useStyles.progress}>{savedList.length} / 15</Text>
            </View>

            {savedList.length === 0 ? (
              <View className={useStyles.emptyState}>
                <Text className={useStyles.emptyIcon}>🎟️</Text>
                <Text className={useStyles.emptyText}>暂无已选号码</Text>
              </View>
            ) : (
              <>
                <View className={useStyles.numberList}>
                  {savedList.map((item, index) => (
                    <SelectedItem
                      key={index}
                      index={index}
                      item={item}
                      onDelete={() => onDelete(index)}
                    />
                  ))}
                </View>
                <View className={useStyles.clearBtn} onClick={onClear}>
                  <Text className={useStyles.clearText}>清空全部</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const IndexPage: React.FC = () => {
  const [selectedRedsA, setSelectedRedsA] = useState<number[]>([]);
  const [selectedBluesA, setSelectedBluesA] = useState<number[]>([]);
  const [selectedRedsB, setSelectedRedsB] = useState<number[]>([]);
  const [selectedBluesB, setSelectedBluesB] = useState<number[]>([]);
  const [savedModeA, setSavedModeA] = useState<SelectedNumbers[]>([]);
  const [savedModeB, setSavedModeB] = useState<SelectedNumbers[]>([]);

  useDidShow(() => {
    try {
      const modeA = storage.get('savedModeA');
      const modeB = storage.get('savedModeB');
      if (modeA) setSavedModeA(modeA);
      if (modeB) setSavedModeB(modeB);
    } catch (e) {
      console.error('Failed to load saved numbers:', e);
    }
  });

  const handleRedClickA = (num: number) => {
    const cfg = MODE_CONFIG.modeA;
    if (selectedRedsA.includes(num)) {
      setSelectedRedsA(selectedRedsA.filter((n) => n !== num));
    } else if (selectedRedsA.length < cfg.redCount) {
      const newReds = [...selectedRedsA, num].sort((a, b) => a - b);
      setSelectedRedsA(newReds);
    }
  };

  const handleBlueClickA = (num: number) => {
    const cfg = MODE_CONFIG.modeA;
    if (selectedBluesA.includes(num)) {
      setSelectedBluesA(selectedBluesA.filter((n) => n !== num));
    } else if (selectedBluesA.length < cfg.blueCount) {
      const newBlues = [...selectedBluesA, num].sort((a, b) => a - b);
      setSelectedBluesA(newBlues);
    }
  };

  const handleRedClickB = (num: number) => {
    const cfg = MODE_CONFIG.modeB;
    if (selectedRedsB.includes(num)) {
      setSelectedRedsB(selectedRedsB.filter((n) => n !== num));
    } else if (selectedRedsB.length < cfg.redCount) {
      const newReds = [...selectedRedsB, num].sort((a, b) => a - b);
      setSelectedRedsB(newReds);
    }
  };

  const handleBlueClickB = (num: number) => {
    const cfg = MODE_CONFIG.modeB;
    if (selectedBluesB.includes(num)) {
      setSelectedBluesB(selectedBluesB.filter((n) => n !== num));
    } else if (selectedBluesB.length < cfg.blueCount) {
      const newBlues = [...selectedBluesB, num].sort((a, b) => a - b);
      setSelectedBluesB(newBlues);
    }
  };

  const randomSelectRedsA = () => {
    const cfg = MODE_CONFIG.modeA;
    const randomReds = generateRandomNumbers(cfg.redCount, cfg.redMax);
    setSelectedRedsA(randomReds);
  };

  const randomSelectBluesA = () => {
    const cfg = MODE_CONFIG.modeA;
    const randomBlues = generateRandomNumbers(cfg.blueCount, cfg.blueMax);
    setSelectedBluesA(randomBlues);
  };

  const randomSelectRedsB = () => {
    const cfg = MODE_CONFIG.modeB;
    const randomReds = generateRandomNumbers(cfg.redCount, cfg.redMax);
    setSelectedRedsB(randomReds);
  };

  const randomSelectBluesB = () => {
    const cfg = MODE_CONFIG.modeB;
    const randomBlues = generateRandomNumbers(cfg.blueCount, cfg.blueMax);
    setSelectedBluesB(randomBlues);
  };

  const clearRedsA = () => setSelectedRedsA([]);
  const clearBluesA = () => setSelectedBluesA([]);
  const clearRedsB = () => setSelectedRedsB([]);
  const clearBluesB = () => setSelectedBluesB([]);

  const saveModeA = () => {
    const cfg = MODE_CONFIG.modeA;
    if (selectedRedsA.length !== cfg.redCount || selectedBluesA.length !== cfg.blueCount) {
      showToast('请选择完整号码');
      return;
    }
    if (savedModeA.length >= 15) {
      showToast('最多保存15组');
      return;
    }
    const newSet = { reds: [...selectedRedsA], blues: [...selectedBluesA] };
    const newList = [...savedModeA, newSet];
    setSavedModeA(newList);
    setSelectedRedsA([]);
    setSelectedBluesA([]);
    try {
      storage.set('savedModeA', newList);
    } catch (e) {
      console.error('Failed to save:', e);
    }
    showToast('保存成功', 'success');
  };

  const saveModeB = () => {
    const cfg = MODE_CONFIG.modeB;
    if (selectedRedsB.length !== cfg.redCount || selectedBluesB.length !== cfg.blueCount) {
      showToast('请选择完整号码');
      return;
    }
    if (savedModeB.length >= 15) {
      showToast('最多保存15组');
      return;
    }
    const newSet = { reds: [...selectedRedsB], blues: [...selectedBluesB] };
    const newList = [...savedModeB, newSet];
    setSavedModeB(newList);
    setSelectedRedsB([]);
    setSelectedBluesB([]);
    try {
      storage.set('savedModeB', newList);
    } catch (e) {
      console.error('Failed to save:', e);
    }
    showToast('保存成功', 'success');
  };

  const handleDeleteModeA = (index: number) => {
    const newList = savedModeA.filter((_, i) => i !== index);
    setSavedModeA(newList);
    try {
      storage.set('savedModeA', newList);
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  const handleDeleteModeB = (index: number) => {
    const newList = savedModeB.filter((_, i) => i !== index);
    setSavedModeB(newList);
    try {
      storage.set('savedModeB', newList);
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  const handleClearModeA = () => {
    setSavedModeA([]);
    try {
      wx.removeStorageSync('savedModeA');
    } catch (e) {
      console.error('Failed to clear:', e);
    }
  };

  const handleClearModeB = () => {
    setSavedModeB([]);
    try {
      wx.removeStorageSync('savedModeB');
    } catch (e) {
      console.error('Failed to clear:', e);
    }
  };

  if (isH5) {
    return (
      <View className={useStyles.pageContainer}>
        <View className={useStyles.pageHeader}>
          <Text className={useStyles.title}>🎰 幸运选号器</Text>
          <Text className={useStyles.subtitle}>选择您的幸运号码，开启好运之旅</Text>
        </View>

        <View className={useStyles.mainContent}>
          <ModeColumn
            mode="modeA"
            selectedReds={selectedRedsA}
            selectedBlues={selectedBluesA}
            savedList={savedModeA}
            onRedClick={handleRedClickA}
            onBlueClick={handleBlueClickA}
            onRandomReds={randomSelectRedsA}
            onRandomBlues={randomSelectBluesA}
            onClearReds={clearRedsA}
            onClearBlues={clearBluesA}
            onDelete={handleDeleteModeA}
            onClear={handleClearModeA}
            onSave={saveModeA}
          />

          <ModeColumn
            mode="modeB"
            selectedReds={selectedRedsB}
            selectedBlues={selectedBluesB}
            savedList={savedModeB}
            onRedClick={handleRedClickB}
            onBlueClick={handleBlueClickB}
            onRandomReds={randomSelectRedsB}
            onRandomBlues={randomSelectBluesB}
            onClearReds={clearRedsB}
            onClearBlues={clearBluesB}
            onDelete={handleDeleteModeB}
            onClear={handleClearModeB}
            onSave={saveModeB}
          />
        </View>

        <View className={useStyles.pageFooter}>
          <Text className={useStyles.footerText}>祝您好运连连，心想事成！🍀</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={useStyles.pageContainer}>
      <View className={useStyles.modeSelector}>
        <View className={`${useStyles.modeItem} ${useStyles.active}`}>
          <Text>非常6+1</Text>
          <Text className={useStyles.modeCount}>{savedModeA.length} 组</Text>
        </View>
        <View className={useStyles.modeItem}>
          <Text>幸运52</Text>
          <Text className={useStyles.modeCount}>{savedModeB.length} 组</Text>
        </View>
      </View>

      <View className={useStyles.contentArea}>
        <View className={useStyles.fullSection}>
          <View className={useStyles.sectionHeader}>
            <View className={useStyles.sectionTitle}>
              <View className={useStyles.redDot}></View>
              <Text className={useStyles.titleText}>前区</Text>
            </View>
            <Text className={useStyles.progress}>{selectedRedsA.length} / 6</Text>
          </View>
          <View className={useStyles.numberGrid}>
            {Array.from({ length: 33 }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${useStyles.numberBall} ${selectedRedsA.includes(num) ? useStyles.selected : ''}`}
                onClick={() => handleRedClickA(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
          <View className={useStyles.buttonRow}>
            <View className={`${useStyles.actionBtn} ${useStyles.primary}`} onClick={randomSelectRedsA}>
              <Text>随机选择</Text>
            </View>
            <View className={`${useStyles.actionBtn} ${useStyles.secondary}`} onClick={clearRedsA}>
              <Text>清空</Text>
            </View>
          </View>
        </View>

        <View className={useStyles.fullSection}>
          <View className={useStyles.sectionHeader}>
            <View className={useStyles.sectionTitle}>
              <View className={useStyles.blueDot}></View>
              <Text className={useStyles.titleText}>后区</Text>
            </View>
            <Text className={useStyles.progress}>{selectedBluesA.length} / 1</Text>
          </View>
          <View className={useStyles.numberGrid}>
            {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${useStyles.numberBall} ${useStyles.blue} ${selectedBluesA.includes(num) ? useStyles.selected : ''}`}
                onClick={() => handleBlueClickA(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
          <View className={useStyles.buttonRow}>
            <View className={`${useStyles.actionBtn} ${useStyles.primary}`} onClick={randomSelectBluesA}>
              <Text>随机选择</Text>
            </View>
            <View className={`${useStyles.actionBtn} ${useStyles.secondary}`} onClick={clearBluesA}>
              <Text>清空</Text>
            </View>
          </View>
        </View>

        <View className={useStyles.savedSection}>
          <View className={useStyles.sectionHeader}>
            <View className={useStyles.sectionTitle}>
              <View className={useStyles.redDot}></View>
              <Text className={useStyles.titleText}>已选号码</Text>
            </View>
            <Text className={useStyles.progress}>{savedModeA.length} / 15</Text>
          </View>

          {savedModeA.length === 0 ? (
            <View className={useStyles.emptyState}>
              <Text className={useStyles.emptyText}>暂无已选号码</Text>
            </View>
          ) : (
            <>
              <View className={useStyles.numberList}>
                {savedModeA.map((item, index) => (
                  <SelectedItem
                    key={index}
                    index={index}
                    item={item}
                    onDelete={() => handleDeleteModeA(index)}
                  />
                ))}
              </View>
              <View className={useStyles.clearBtn} onClick={handleClearModeA}>
                <Text className={useStyles.clearText}>清空全部</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View className={useStyles.bottomBar}>
        <View className={`${useStyles.confirmBtn}`} onClick={saveModeA}>
          <Text>保存选号</Text>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
