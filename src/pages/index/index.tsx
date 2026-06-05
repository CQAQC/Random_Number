import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
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
    blueLabel: '后区'
  },
  modeB: {
    name: '幸运52',
    redCount: 5,
    redMax: 35,
    blueCount: 2,
    blueMax: 12,
    redLabel: '前区',
    blueLabel: '后区'
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

const NumberBall: React.FC<{
  number: number;
  isSelected: boolean;
  color: 'red' | 'blue';
  onClick: () => void;
}> = ({ number, isSelected, color, onClick }) => {
  return (
    <View
      className={`${styles.numberBall} ${styles[color]} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <Text>{number.toString().padStart(2, '0')}</Text>
    </View>
  );
};

const SelectedItem: React.FC<{
  index: number;
  numbers: SelectedNumbers;
  onDelete: () => void;
}> = ({ index, numbers, onDelete }) => {
  return (
    <View className={styles.selectedItem}>
      <View className={styles.serialNumber}>
        <Text>{index + 1}</Text>
      </View>
      <View className={styles.numbers}>
        {numbers.reds.map((num) => (
          <View key={`${index}-red-${num}`} className={`${styles.num} ${styles.red}`}>
            <Text>{num.toString().padStart(2, '0')}</Text>
          </View>
        ))}
        {numbers.blues.map((num) => (
          <View key={`${index}-blue-${num}`} className={`${styles.num} ${styles.blue}`}>
            <Text>{num.toString().padStart(2, '0')}</Text>
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
  const [savedNumbers, setSavedNumbers] = useState<SelectedNumbers[]>([]);

  const config = MODE_CONFIG[currentMode];

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

  const clearAll = () => {
    setSelectedReds([]);
    setSelectedBlues([]);
  };

  const confirmSelection = () => {
    if (selectedReds.length !== config.redCount || selectedBlues.length !== config.blueCount) {
      return;
    }
    if (savedNumbers.length >= 10) {
      return;
    }
    const newSet = {
      reds: [...selectedReds],
      blues: [...selectedBlues]
    };
    setSavedNumbers([...savedNumbers, newSet]);
    clearAll();
  };

  const deleteSaved = (index: number) => {
    const newList = savedNumbers.filter((_, i) => i !== index);
    setSavedNumbers(newList);
  };

  const clearSaved = () => {
    setSavedNumbers([]);
  };

  const canConfirm = selectedReds.length === config.redCount && selectedBlues.length === config.blueCount && savedNumbers.length < 10;

  return (
    <View className={styles.pageContainer}>
      <View className={styles.modeSelector}>
        <View
          className={`${styles.modeItem} ${currentMode === 'modeA' ? styles.active : styles.inactive}`}
          onClick={() => {
            setCurrentMode('modeA');
            clearAll();
          }}
        >
          <Text>非常6+1</Text>
        </View>
        <View
          className={`${styles.modeItem} ${currentMode === 'modeB' ? styles.active : styles.inactive}`}
          onClick={() => {
            setCurrentMode('modeB');
            clearAll();
          }}
        >
          <Text>幸运52</Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.sectionTitle}>
          <Text className={styles.title}>{config.redLabel}</Text>
          <Text className={styles.count}>{selectedReds.length} / {config.redCount}</Text>
        </View>
        <View className={styles.numberGrid}>
          {Array.from({ length: config.redMax }, (_, i) => i + 1).map((num) => (
            <NumberBall
              key={num}
              number={num}
              isSelected={selectedReds.includes(num)}
              color="red"
              onClick={() => handleRedClick(num)}
            />
          ))}
        </View>
        <View className={styles.buttonArea}>
          <View className={`${styles.btn} ${styles.primary}`} onClick={randomSelectReds}>
            <Text>随机选择</Text>
          </View>
          <View className={`${styles.btn} ${styles.secondary}`} onClick={() => setSelectedReds([])}>
            <Text>清空</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.sectionTitle}>
          <Text className={styles.title}>{config.blueLabel}</Text>
          <Text className={styles.count}>{selectedBlues.length} / {config.blueCount}</Text>
        </View>
        <View className={styles.numberGrid}>
          {Array.from({ length: config.blueMax }, (_, i) => i + 1).map((num) => (
            <NumberBall
              key={num}
              number={num}
              isSelected={selectedBlues.includes(num)}
              color="blue"
              onClick={() => handleBlueClick(num)}
            />
          ))}
        </View>
        <View className={styles.buttonArea}>
          <View className={`${styles.btn} ${styles.primary}`} onClick={randomSelectBlues}>
            <Text>随机选择</Text>
          </View>
          <View className={`${styles.btn} ${styles.secondary}`} onClick={() => setSelectedBlues([])}>
            <Text>清空</Text>
          </View>
        </View>
      </View>

      <View className={`${styles.confirmButton} ${canConfirm ? '' : styles.disabled}`} onClick={confirmSelection}>
        <Text>确认选择</Text>
      </View>
      <Text className={styles.infoText}>已选列表最多保存 10 组号码</Text>

      <View className={styles.selectedSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>已选号码</Text>
          {savedNumbers.length > 0 && (
            <Text className={styles.clearBtn} onClick={clearSaved}>清空全部</Text>
          )}
        </View>
        {savedNumbers.length === 0 ? (
          <View className={styles.emptyState}>
            <Text>暂无已选号码</Text>
          </View>
        ) : (
          <View className={styles.selectedList}>
            {savedNumbers.map((item, index) => (
              <SelectedItem
                key={index}
                index={index}
                numbers={item}
                onDelete={() => deleteSaved(index)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default IndexPage;
