import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

type ModeType = 'modeA' | 'modeB';

interface SelectedNumbers {
  reds: number[];
  blues: number[];
}

const MODE_CONFIG = {
  modeA: {
    name: '非常6+1',
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
    <View className={styles.numberItem}>
      <View className={styles.itemIndex}>
        <Text>{index + 1}</Text>
      </View>
      <View className={styles.balls}>
        {item.reds.map((num) => (
          <View key={`red-${num}`} className={`${styles.ball} ${styles.redBall}`}>
            <Text className={styles.ballText}>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
        {item.blues.map((num) => (
          <View key={`blue-${num}`} className={`${styles.ball} ${styles.blueBall}`}>
            <Text className={styles.ballText}>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
      </View>
      <View className={styles.deleteBtn} onClick={onDelete}>
        <Text>×</Text>
      </View>
    </View>
  );
};

const IndexPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ModeType>('modeA');
  const [selectedReds, setSelectedReds] = useState<number[]>([]);
  const [selectedBlues, setSelectedBlues] = useState<number[]>([]);
  const [savedModeA, setSavedModeA] = useState<SelectedNumbers[]>([]);
  const [savedModeB, setSavedModeB] = useState<SelectedNumbers[]>([]);

  const config = MODE_CONFIG[currentMode];

  useDidShow(() => {
    try {
      const modeA = wx.getStorageSync('savedModeA');
      const modeB = wx.getStorageSync('savedModeB');
      if (modeA) setSavedModeA(modeA);
      if (modeB) setSavedModeB(modeB);
    } catch (e) {
      console.error('Failed to load saved numbers:', e);
    }
  });

  const getCurrentSavedNumbers = () => {
    return currentMode === 'modeA' ? savedModeA : savedModeB;
  };

  const handleRedClick = (num: number) => {
    if (selectedReds.includes(num)) {
      setSelectedReds(selectedReds.filter((n) => n !== num));
    } else if (selectedReds.length < config.redCount) {
      const newReds = [...selectedReds, num].sort((a, b) => a - b);
      setSelectedReds(newReds);
    }
  };

  const handleBlueClick = (num: number) => {
    if (selectedBlues.includes(num)) {
      setSelectedBlues(selectedBlues.filter((n) => n !== num));
    } else if (selectedBlues.length < config.blueCount) {
      const newBlues = [...selectedBlues, num].sort((a, b) => a - b);
      setSelectedBlues(newBlues);
    }
  };

  const randomSelectReds = () => {
    const randomReds = generateRandomNumbers(config.redCount, config.redMax);
    setSelectedReds(randomReds);
  };

  const randomSelectBlues = () => {
    const randomBlues = generateRandomNumbers(config.blueCount, config.blueMax);
    setSelectedBlues(randomBlues);
  };

  const clearReds = () => {
    setSelectedReds([]);
  };

  const clearBlues = () => {
    setSelectedBlues([]);
  };

  const confirmSelection = () => {
    if (selectedReds.length !== config.redCount || selectedBlues.length !== config.blueCount) {
      return;
    }
    if (getCurrentSavedNumbers().length >= 15) {
      wx.showToast({ title: '最多保存15组', icon: 'none' });
      return;
    }
    const newSet = {
      reds: [...selectedReds],
      blues: [...selectedBlues]
    };
    
    if (currentMode === 'modeA') {
      const newList = [...savedModeA, newSet];
      setSavedModeA(newList);
      try {
        wx.setStorageSync('savedModeA', newList);
      } catch (e) {
        console.error('Failed to save:', e);
      }
    } else {
      const newList = [...savedModeB, newSet];
      setSavedModeB(newList);
      try {
        wx.setStorageSync('savedModeB', newList);
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }
    
    setSelectedReds([]);
    setSelectedBlues([]);
    wx.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleModeChange = (mode: ModeType) => {
    if (mode !== currentMode) {
      setCurrentMode(mode);
      setSelectedReds([]);
      setSelectedBlues([]);
    }
  };

  const handleDeleteModeA = (index: number) => {
    const newList = savedModeA.filter((_, i) => i !== index);
    setSavedModeA(newList);
    try {
      wx.setStorageSync('savedModeA', newList);
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  const handleDeleteModeB = (index: number) => {
    const newList = savedModeB.filter((_, i) => i !== index);
    setSavedModeB(newList);
    try {
      wx.setStorageSync('savedModeB', newList);
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

  const canConfirm = selectedReds.length === config.redCount && selectedBlues.length === config.blueCount;
  const totalCount = savedModeA.length + savedModeB.length;

  const renderNumberSelect = (mode: ModeType) => {
    const cfg = MODE_CONFIG[mode];
    const reds = mode === 'modeA' && currentMode === 'modeA' ? selectedReds : (mode === 'modeB' && currentMode === 'modeB' ? selectedReds : []);
    const blues = mode === 'modeA' && currentMode === 'modeA' ? selectedBlues : (mode === 'modeB' && currentMode === 'modeB' ? selectedBlues : []);
    const savedList = mode === 'modeA' ? savedModeA : savedModeB;
    const onDelete = mode === 'modeA' ? handleDeleteModeA : handleDeleteModeB;
    const onClear = mode === 'modeA' ? handleClearModeA : handleClearModeB;

    return (
      <View className={styles.modeSwiperItem}>
        {/* 前区选择 */}
        <View className={styles.fullSection}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <View className={styles.redDot}></View>
              <Text className={styles.titleText}>{cfg.redLabel}</Text>
            </View>
            <Text className={styles.progress}>{reds.length} / {cfg.redCount}</Text>
          </View>
          
          <View className={styles.numberGrid}>
            {Array.from({ length: cfg.redMax }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${styles.numberBall} ${reds.includes(num) ? styles.selected : ''}`}
                onClick={() => mode === currentMode && handleRedClick(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
          
          <View className={styles.buttonRow}>
            <View 
              className={`${styles.actionBtn} ${styles.primary}`} 
              onClick={() => mode === currentMode && randomSelectReds()}
            >
              <Text>随机选择</Text>
            </View>
            <View 
              className={`${styles.actionBtn} ${styles.secondary}`} 
              onClick={() => mode === currentMode && clearReds()}
            >
              <Text>清空</Text>
            </View>
          </View>
        </View>

        {/* 后区选择 */}
        <View className={styles.fullSection}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <View className={styles.blueDot}></View>
              <Text className={styles.titleText}>{cfg.blueLabel}</Text>
            </View>
            <Text className={styles.progress}>{blues.length} / {cfg.blueCount}</Text>
          </View>
          
          <View className={styles.numberGrid}>
            {Array.from({ length: cfg.blueMax }, (_, i) => i + 1).map((num) => (
              <View
                key={num}
                className={`${styles.numberBall} ${styles.blue} ${blues.includes(num) ? styles.selected : ''}`}
                onClick={() => mode === currentMode && handleBlueClick(num)}
              >
                <Text>{num.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
          
          <View className={styles.buttonRow}>
            <View 
              className={`${styles.actionBtn} ${styles.primary}`} 
              onClick={() => mode === currentMode && randomSelectBlues()}
            >
              <Text>随机选择</Text>
            </View>
            <View 
              className={`${styles.actionBtn} ${styles.secondary}`} 
              onClick={() => mode === currentMode && clearBlues()}
            >
              <Text>清空</Text>
            </View>
          </View>
        </View>

        {/* 已选号码区域 */}
        <View className={styles.savedSection}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <View className={mode === 'modeA' ? styles.redDot : styles.blueDot}></View>
              <Text className={styles.titleText}>已选号码</Text>
            </View>
            <Text className={styles.progress}>{savedList.length} / 15</Text>
          </View>
          
          {savedList.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无已选号码</Text>
            </View>
          ) : (
            <>
              <View className={styles.numberList}>
                {savedList.map((item, index) => (
                  <SelectedItem
                    key={index}
                    index={index}
                    item={item}
                    onDelete={() => onDelete(index)}
                  />
                ))}
              </View>
              <View className={styles.clearBtn} onClick={onClear}>
                <Text className={styles.clearText}>清空全部</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className={styles.pageContainer}>
      {/* 玩法选择 */}
      <View className={styles.modeSelector}>
        <View
          className={`${styles.modeItem} ${currentMode === 'modeA' ? styles.active : ''}`}
          onClick={() => handleModeChange('modeA')}
        >
          <Text>非常6+1</Text>
          <Text className={styles.modeCount}>{savedModeA.length} 组</Text>
        </View>
        <View
          className={`${styles.modeItem} ${currentMode === 'modeB' ? styles.active : ''}`}
          onClick={() => handleModeChange('modeB')}
        >
          <Text>幸运52</Text>
          <Text className={styles.modeCount}>{savedModeB.length} 组</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View className={styles.contentArea}>
        {renderNumberSelect(currentMode)}
      </View>

      {/* 底部操作区 */}
      <View className={styles.bottomBar}>
        <View 
          className={`${styles.confirmBtn} ${canConfirm ? '' : styles.disabled}`}
          onClick={confirmSelection}
        >
          <Text>保存选号</Text>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
