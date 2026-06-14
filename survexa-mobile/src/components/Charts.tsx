import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { brandColors } from '../theme/colors';

const screenWidth = Dimensions.get('window').width - 40; // Card padding

export function BarChartView() {
  const data = [40, 75, 55, 90, 65];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const colors = [brandColors.lavender, brandColors.cyan, brandColors.mint, brandColors.peach, brandColors.periwinkle];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Responses</Text>
      <Svg height="160" width={screenWidth}>
        {data.map((val, idx) => {
          const barWidth = 32;
          const x = 30 + idx * ((screenWidth - 60) / 5);
          const barHeight = val * 1.2;
          const y = 140 - barHeight;

          return (
            <React.Fragment key={idx}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors[idx]}
                rx="8"
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.labelRow}>
        {labels.map((lbl, idx) => (
          <Text key={idx} style={styles.axisLabel}>{lbl}</Text>
        ))}
      </View>
    </View>
  );
}

export function PieChartView() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Segment Breakdown</Text>
      <View style={styles.row}>
        <Svg height="120" width="120">
          {/* Doughnut segments represented as clean SVG circle dashes */}
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke={brandColors.lavender}
            strokeWidth="20"
            fill="transparent"
            strokeDasharray="282"
            strokeDashoffset="70"
          />
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke={brandColors.cyan}
            strokeWidth="20"
            fill="transparent"
            strokeDasharray="282"
            strokeDashoffset="180"
          />
          <Circle
            cx="60"
            cy="60"
            r="45"
            stroke={brandColors.pink}
            strokeWidth="20"
            fill="transparent"
            strokeDasharray="282"
            strokeDashoffset="250"
          />
        </Svg>
        <View style={styles.legend}>
          <LegendItem color={brandColors.lavender} text="Enterprise (45%)" />
          <LegendItem color={brandColors.cyan} text="SMB (35%)" />
          <LegendItem color={brandColors.pink} text="Individual (20%)" />
        </View>
      </View>
    </View>
  );
}

export function LineChartView() {
  const points = 'M 30 110 Q 90 40, 150 80 T 270 30 T 350 70';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NPS Trend (Q2)</Text>
      <Svg height="150" width={screenWidth}>
        <Defs>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#8B5CF6" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        {/* Shaded Area */}
        <Path
          d={`${points} L 350 140 L 30 140 Z`}
          fill="url(#lineGrad)"
        />
        {/* Line Path */}
        <Path
          d={points}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="3.5"
        />
      </Svg>
    </View>
  );
}

function LegendItem({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  legend: {
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
});
