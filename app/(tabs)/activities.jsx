import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { FontAwesome5 } from "@expo/vector-icons";
import { Card, Title, Paragraph, Button, Chip } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { ThemeContext } from "../../contexts/ThemeContext";
import { fetchActivities } from "../../store/slices/activitiesSlice";
import { format, isToday, isTomorrow, parseISO, addDays } from "date-fns";
import { he, enUS } from "date-fns/locale";
import i18n from "../../lib/i18n";
import CalendarStrip from "react-native-calendar-strip";
import ErrorScreen from "../../components/common/ErrorScreen";
import { router } from "expo-router";

export default function ActivitiesScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const activities = useSelector(
    (state) => state.activities.dailyActivities?.activities || []
  );
  const loading = useSelector((state) => state.activities.loading);
  const error = useSelector((state) => state.activities.error);

  const locale = i18n.language === "he" ? he : enUS;

  const fetchActivitiesData = async (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    await dispatch(fetchActivities(formattedDate));
  };

  useEffect(() => {
    fetchActivitiesData(selectedDate);
  }, [selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivitiesData(selectedDate);
    setRefreshing(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date.toDate());
  };

  const getDateLabel = (date) => {
    if (isToday(date)) {
      return t("activities.today");
    } else if (isTomorrow(date)) {
      return t("activities.tomorrow");
    } else {
      return format(date, "EEEE, d MMMM", { locale });
    }
  };

  const renderActivityItem = ({ item }) => {
    const startTime = item.startTime;
    const endTime = item.endTime;

    return (
      <TouchableOpacity onPress={() => router.push(`/activity/${item.id}`)}>
        <Card
          style={[styles.activityCard, { backgroundColor: theme.colors.card }]}
        >
          <Card.Content>
            <View style={styles.activityTimeContainer}>
              <Text
                style={[styles.activityTime, { color: theme.colors.primary }]}
              >
                {startTime} - {endTime}
              </Text>
            </View>

            <Title style={[styles.activityTitle, { color: theme.colors.text }]}>
              {item.title}
            </Title>

            <Paragraph
              style={[styles.activityDescription, { color: theme.colors.text }]}
            >
              {item.description}
            </Paragraph>

            <View style={styles.activityInfoRow}>
              <View style={styles.activityInfo}>
                <FontAwesome5
                  name="map-marker-alt"
                  size={16}
                  color={theme.colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {item.location}
                </Text>
              </View>

              {item.instructor && (
                <View style={styles.activityInfo}>
                  <FontAwesome5
                    name="user"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.infoIcon}
                  />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>
                    {item.instructor}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionsContainer}>
              {item.isRegistered ? (
                <Chip
                  mode="outlined"
                  style={[
                    styles.registeredChip,
                    { borderColor: theme.colors.success },
                  ]}
                  textStyle={{ color: theme.colors.success }}
                >
                  {t("activities.registered")}
                </Chip>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => router.push(`/activity/${item.id}`)}
                  style={[
                    styles.detailsButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  labelStyle={styles.detailsButtonLabel}
                >
                  {t("activities.details")}
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5
        name="calendar-times"
        size={50}
        color={theme.colors.text}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {t("activities.noActivities")}
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          const tomorrow = addDays(new Date(), 1);
          setSelectedDate(tomorrow);
        }}
        style={[
          styles.checkTomorrowButton,
          { borderColor: theme.colors.primary },
        ]}
        labelStyle={{ color: theme.colors.primary }}
      >
        {t("activities.checkTomorrow")}
      </Button>
    </View>
  );

  if (error && !refreshing) {
    return <ErrorScreen error={error} onRetry={onRefresh} />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t("activities.title")}</Text>
      </View>

      <CalendarStrip
        scrollable
        style={[styles.calendar, { backgroundColor: theme.colors.primary }]}
        calendarColor={theme.colors.primary}
        highlightDateNumberStyle={{ color: "#fff", fontWeight: "bold" }}
        highlightDateNameStyle={{ color: "#fff" }}
        dateNumberStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
        dateNameStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
        iconContainer={{ flex: 0.1 }}
        selectedDate={selectedDate}
        onDateSelected={handleDateChange}
        startingDate={new Date()}
        minDate={new Date()}
        maxDate={addDays(new Date(), 30)}
        // Replace the string locale with a proper locale object
        locale={{
          name: i18n.language,
          config:
            i18n.language === "he"
              ? {
                  monthNames: [
                    "ינואר",
                    "פברואר",
                    "מרץ",
                    "אפריל",
                    "מאי",
                    "יוני",
                    "יולי",
                    "אוגוסט",
                    "ספטמבר",
                    "אוקטובר",
                    "נובמבר",
                    "דצמבר",
                  ],
                  dayNames: [
                    "ראשון",
                    "שני",
                    "שלישי",
                    "רביעי",
                    "חמישי",
                    "שישי",
                    "שבת",
                  ],
                  dayNamesShort: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
                }
              : {
                  monthNames: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ],
                  dayNames: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  dayNamesShort: [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ],
                },
        }}
      />

      <View style={styles.dateHeaderContainer}>
        <Text style={[styles.dateHeader, { color: theme.colors.text }]}>
          {getDateLabel(selectedDate)}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  calendar: {
    height: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dateHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for potential emergency button
  },
  activityCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  activityTimeContainer: {
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  activityDescription: {
    marginBottom: 12,
  },
  activityInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  registeredChip: {
    height: 36,
  },
  detailsButton: {
    borderRadius: 20,
  },
  detailsButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  checkTomorrowButton: {
    marginTop: 10,
  },
});
